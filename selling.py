from bson import ObjectId
from aiogram.types import Message
from aiogram import F
from aiogram.filters import Command
from aiogram.fsm.state import StatesGroup, State
from aiogram.filters import StateFilter
from telethon.sessions import StringSession as TeleStringSession
from telethon.errors import SessionPasswordNeededError

# Sell FSM
class SellState(StatesGroup):
    waiting_country = State()
    waiting_number = State()
    waiting_otp = State()
    waiting_password = State()

# sells collection
sells_col = db["sells"]

# /sell command - entry
@dp.message(Command("sell"))
async def cmd_sell_start(message: Message, state: FSMContext):
    if not await check_join(bot, message):
        return

    countries = list(countries_col.find({}))
    if not countries:
        return await message.answer("❌ Sorry, sell system is not configured. Admin must add countries first.")

    kb = InlineKeyboardBuilder()
    for c in countries:
        kb.button(text=c["name"], callback_data=f"sell_country:{c['name']}")
    kb.adjust(2)
    await message.answer("🌍 Select the country of the account you want to sell:", reply_markup=kb.as_markup())
    await state.set_state(SellState.waiting_country)

# When user selects country
@dp.callback_query(F.data.startswith("sell_country:"))
async def callback_sell_country(cq: CallbackQuery, state: FSMContext):
    await cq.answer()
    _, country_name = cq.data.split(":", 1)
    await state.update_data(country=country_name)
    await cq.message.answer(f"📞 Send the phone number for <b>{country_name}</b> (e.g., +14151234567):", parse_mode="HTML")
    await state.set_state(SellState.waiting_number)

# User sends number -> send code request
@dp.message(StateFilter(SellState.waiting_number))
async def sell_receive_number(msg: Message, state: FSMContext):
    data = await state.get_data()
    country = data.get("country")
    phone = msg.text.strip()
    await state.update_data(number=phone)

    try:
        api_id = int(os.getenv("API_ID"))
        api_hash = os.getenv("API_HASH")
    except Exception:
        return await msg.answer("❌ API_ID / API_HASH not configured on server.")

    # create temporary session and send code
    temp_session = TeleStringSession()
    client = TelegramClient(temp_session, api_id, api_hash)
    await client.connect()
    try:
        sent = await client.send_code_request(phone)
        # store temporary info in state
        await state.update_data(session=temp_session.save(), phone_code_hash=sent.phone_code_hash)
        await msg.answer("📩 Code sent! Please send the OTP you received (from Telegram or SMS).")
        await state.set_state(SellState.waiting_otp)
        await client.disconnect()
    except Exception as e:
        await client.disconnect()
        await msg.answer(f"❌ Failed to send code: {e}")

# User sends OTP -> try sign in
@dp.message(StateFilter(SellState.waiting_otp))
async def sell_receive_otp(msg: Message, state: FSMContext):
    data = await state.get_data()
    phone = data.get("number")
    session_str = data.get("session")
    phone_code_hash = data.get("phone_code_hash")

    try:
        api_id = int(os.getenv("API_ID"))
        api_hash = os.getenv("API_HASH")
    except Exception:
        return await msg.answer("❌ API_ID / API_HASH not configured on server.")

    client = TelegramClient(TeleStringSession(session_str), api_id, api_hash)
    await client.connect()
    code = msg.text.strip()

    try:
        await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
        string_session = client.session.save()
        await client.disconnect()

        # Save sell request (pending)
        sell_doc = {
            "seller_id": msg.from_user.id,
            "seller_username": msg.from_user.username or None,
            "country": data.get("country"),
            "number": phone,
            "string_session": string_session,
            "price": countries_col.find_one({"name": data.get("country")}).get("price", 0) if countries_col.find_one({"name": data.get("country")}) else 0,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        sell_id = sells_col.insert_one(sell_doc).inserted_id

        # Notify seller
        await msg.answer("✅ Account prepared and sent for admin approval.\n\n<code>Waiting for admin approval please logout your id for approval.</code>", parse_mode="HTML")

        # Send to admins with Approve/Decline buttons
        kb = InlineKeyboardBuilder()
        kb.row(
            InlineKeyboardButton(text="✅ Approve", callback_data=f"approve_sell:{sell_id}"),
            InlineKeyboardButton(text="❌ Decline", callback_data=f"decline_sell:{sell_id}")
        )
        admin_text = (
            f"<b>🔔 New Sell Request</b>\n\n"
            f"👤 Seller: @{msg.from_user.username or msg.from_user.full_name} (<code>{msg.from_user.id}</code>)\n"
            f"🌍 Country: {data.get('country')}\n"
            f"📞 Number: +{phone}\n"
            f"💵 Price: ₹{sell_doc['price']}\n\n"
            "Approve to add to stock and credit seller."
        )
        for admin_id in ADMIN_IDS:
            try:
                await bot.send_message(admin_id, admin_text, parse_mode="HTML", reply_markup=kb.as_markup())
            except Exception:
                pass

        await state.clear()
    except SessionPasswordNeededError:
        await client.disconnect()
        # ask for 2FA password
        await state.update_data(session=session_str)
        await msg.answer("🔐 This account has two-step verification enabled. Please send the 2FA password now:")
        await state.set_state(SellState.waiting_password)
    except Exception as e:
        await client.disconnect()
        await msg.answer(f"❌ Error verifying OTP: {e}")

# If 2FA password required
@dp.message(StateFilter(SellState.waiting_password))
async def sell_receive_password(msg: Message, state: FSMContext):
    data = await state.get_data()
    phone = data.get("number")
    session_str = data.get("session")

    try:
        api_id = int(os.getenv("API_ID"))
        api_hash = os.getenv("API_HASH")
    except Exception:
        return await msg.answer("❌ API_ID / API_HASH not configured on server.")

    client = TelegramClient(TeleStringSession(session_str), api_id, api_hash)
    await client.connect()
    password = msg.text.strip()

    try:
        await client.sign_in(password=password)
        string_session = client.session.save()
        await client.disconnect()

        sell_doc = {
            "seller_id": msg.from_user.id,
            "seller_username": msg.from_user.username or None,
            "country": data.get("country"),
            "number": phone,
            "string_session": string_session,
            "price": countries_col.find_one({"name": data.get("country")}).get("price", 0) if countries_col.find_one({"name": data.get("country")}) else 0,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        sell_id = sells_col.insert_one(sell_doc).inserted_id

        await msg.answer("✅ Account prepared and sent for admin approval.\n\n<code>Waiting for admin approval please logout your id for approval.</code>", parse_mode="HTML")

        kb = InlineKeyboardBuilder()
        kb.row(
            InlineKeyboardButton(text="✅ Approve", callback_data=f"approve_sell:{sell_id}"),
            InlineKeyboardButton(text="❌ Decline", callback_data=f"decline_sell:{sell_id}")
        )
        admin_text = (
            f"<b>🔔 New Sell Request (2FA)</b>\n\n"
            f"👤 Seller: @{msg.from_user.username or msg.from_user.full_name} (<code>{msg.from_user.id}</code>)\n"
            f"🌍 Country: {data.get('country')}\n"
            f"📞 Number: +{phone}\n"
            f"💵 Price: ₹{sell_doc['price']}\n\n"
            "Approve to add to stock and credit seller."
        )
        for admin_id in ADMIN_IDS:
            try:
                await bot.send_message(admin_id, admin_text, parse_mode="HTML", reply_markup=kb.as_markup())
            except Exception:
                pass

        await state.clear()
    except Exception as e:
        await client.disconnect()
        await msg.answer(f"❌ Error signing in with password: {e}")

# Admin approves sell
@dp.callback_query(F.data.startswith("approve_sell:"))
async def callback_approve_sell(cq: CallbackQuery):
    if not is_admin(cq.from_user.id):
        return await cq.answer("❌ Not authorized.", show_alert=True)

    sell_id = cq.data.split(":", 1)[1]
    try:
        sell_doc = sells_col.find_one({"_id": ObjectId(sell_id)})
    except Exception:
        return await cq.answer("❌ Invalid sell id.", show_alert=True)

    if not sell_doc:
        return await cq.answer("❌ Sell request not found.", show_alert=True)
    if sell_doc.get("status") == "approved":
        return await cq.answer("⚠️ Already approved.", show_alert=True)
        
        # Safe channel notification (no sensitive credentials posted)
CHANNEL_ID = -1001234567890  # replace with your channel id (private channel)
def mask_number(num):
    # show only last 4 digits, replace rest with ×
    digits = ''.join(ch for ch in num if ch.isdigit())
    if len(digits) <= 4:
        return num
    return '×' * (len(digits)-4) + digits[-4:]

@dp.callback_query(F.data.startswith("approve_sell:"))
async def callback_approve_sell(cq: CallbackQuery):
    if not is_admin(cq.from_user.id):
        return await cq.answer("❌ Not authorized.", show_alert=True)

    sell_id = cq.data.split(":", 1)[1]
    sell_doc = sells_col.find_one({"_id": ObjectId(sell_id)})
    if not sell_doc:
        return await cq.answer("❌ Sell request not found.", show_alert=True)

    # ... (existing approval logic: insert to numbers_col, credit seller, etc.) ...

    # Prepare safe channel message (NO password/code/session)
    country = sell_doc.get("country", "Unknown")
    price = sell_doc.get("price", 0)
    server = "Server (1)"  # modify as needed or fetch from sell_doc
    masked_num = mask_number(sell_doc.get("number",""))
    seller_id_masked = str(sell_doc.get("seller_id","")) 
    # Mask seller id (show partly)
    if len(seller_id_masked) > 4:
        seller_id_masked = "••" + seller_id_masked[-4:]

    channel_text = (
        "✅ Number purchased successfully ✅\n\n"
        f"➖ الدولة : {country}\n"
        f"➖ السعر : ${price}\n"
        f"➖ السيـرفر : {server}\n"
        f"➖ الرقم  : {masked_num}\n"
        f"➖ العميل : {seller_id_masked} 🆔\n\n"
        "➕ كود التفعيل : — محفوظ — 💬\n"
        "➕ المرسل : Теlegгам\n"
        "➕ باسورد: — محفوظ — 🔐\n\n"
        "⚠️ Credentials have been withheld for security. Admin will deliver them to the buyer via secure DM after payment."
    )

    try:
        await bot.send_message(CHANNEL_ID, channel_text)
    except Exception as e:
        # log error if needed
        pass

    await cq.answer("Approved and safe notification posted to channel.")
    
    # Insert into numbers collection (available stock)
    numbers_col.insert_one({
        "country": sell_doc["country"],
        "number": sell_doc["number"],
        "string_session": sell_doc["string_session"],
        "used": False,
        "added_by": sell_doc["seller_id"],
        "added_at": datetime.utcnow()
    })

    # Mark sell as approved
    sells_col.update_one({"_id": ObjectId(sell_id)}, {"$set": {"status": "approved", "approved_by": cq.from_user.id, "approved_at": datetime.utcnow()}})

    # Credit seller
    price = float(sell_doc.get("price", 0) or 0)
    seller = users_col.find_one({"_id": sell_doc["seller_id"]})
    if not seller:
        # create seller record if not exists
        users_col.insert_one({"_id": sell_doc["seller_id"], "username": sell_doc.get("seller_username"), "balance": price})
        new_balance = price
    else:
        new_balance = seller.get("balance", 0.0) + price
        users_col.update_one({"_id": seller["_id"]}, {"$set": {"balance": new_balance}})

    # notify seller
    try:
        await bot.send_message(sell_doc["seller_id"], f"✅ Your account +{sell_doc['number']} has been approved by admin.\n💵 Amount credited: ₹{price:.2f}\n💰 New Balance: ₹{new_balance:.2f}")
    except Exception:
        pass

    await cq.message.edit_text(cq.message.text + f"\n\n✅ Approved by <code>{cq.from_user.id}</code>", parse_mode="HTML")
    await cq.answer("Approved and seller credited.")

# Admin declines sell
@dp.callback_query(F.data.startswith("decline_sell:"))
async def callback_decline_sell(cq: CallbackQuery):
    if not is_admin(cq.from_user.id):
        return await cq.answer("❌ Not authorized.", show_alert=True)

    sell_id = cq.data.split(":", 1)[1]
    try:
        sell_doc = sells_col.find_one({"_id": ObjectId(sell_id)})
    except Exception:
        return await cq.answer("❌ Invalid sell id.", show_alert=True)

    if not sell_doc:
        return await cq.answer("❌ Sell request not found.", show_alert=True)
    if sell_doc.get("status") == "declined":
        return await cq.answer("⚠️ Already declined.", show_alert=True)

    sells_col.update_one({"_id": ObjectId(sell_id)}, {"$set": {"status": "declined", "declined_by": cq.from_user.id, "declined_at": datetime.utcnow()}})

    # Notify seller
    try:
        await bot.send_message(sell_doc["seller_id"], f"❌ Your sell request for +{sell_doc['number']} has been declined by admin.")
    except Exception:
        pass

    await cq.message.edit_text(cq.message.text + f"\n\n❌ Declined by <code>{cq.from_user.id}</code>", parse_mode="HTML")
    await cq.answer("Declined.")
# ----------------- End Sell flow -----------------

# ----------------- Admin: set price for country -----------------
@dp.message(Command("setprice"))
async def cmd_setprice(message: Message):
    # permission check
    if not is_admin(message.from_user.id):
        return await message.reply("❌ You are not authorized to use this command.")

    # parse args
    # expected: /setprice +<country_code> <country name (can be multiple words)> <price>
    text = message.text or ""
    parts = text.split()
    # remove command token if present
    if parts and parts[0].lower().startswith("/setprice"):
        parts = parts[1:]

    if len(parts) < 3:
        return await message.reply("❌ Usage: /setprice +<code> <country name> <price>\nExample: /setprice +1 USA 30")

    country_code = parts[0].strip()
    price_str = parts[-1]
    country_name = " ".join(parts[1:-1]).strip()

    # validate price
    try:
        price = float(price_str)
    except ValueError:
        return await message.reply("❌ Price must be a number. Example: 30 or 45.5")

    # Normalize country name (optional)
    country_key = country_name.title()

    # Upsert into countries collection
    now = datetime.utcnow()
    result = countries_col.update_one(
        {"code": country_code, "name": country_key},
        {"$set": {"code": country_code, "name": country_key, "price": price, "updated_at": now}},
        upsert=True
    )

    await message.reply(f"✅ Price set: {country_key} ({country_code}) → {price}\nSaved to database.")
# ----------------- End setprice -----------------
