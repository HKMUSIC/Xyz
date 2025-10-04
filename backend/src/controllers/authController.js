import { auth } from "../utils/firebaseAdmin.js";

export const verifyAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await auth.verifyIdToken(token);
    if (decoded.admin !== true)
      return res.status(403).json({ error: "Not an admin" });

    res.json({ message: "Welcome admin!", user: decoded });
  } catch (err) {
    res.status(500).json({ error: "Auth failed" });
  }
};
