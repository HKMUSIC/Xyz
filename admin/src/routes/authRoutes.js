import express from "express";
import { authAdmin } from "../utils/firebaseAdmin.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// ✅ Set admin role (for setup only)
router.post("/setAdmin", verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    // only existing admin can set new admin
    const user = await authAdmin.getUserByEmail(req.user.email);
    if (!user.customClaims?.admin) {
      return res.status(403).json({ error: "Only admins can assign roles" });
    }

    const targetUser = await authAdmin.getUserByEmail(email);
    await authAdmin.setCustomUserClaims(targetUser.uid, { admin: true });

    res.json({ message: `✅ ${email} promoted to admin.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
