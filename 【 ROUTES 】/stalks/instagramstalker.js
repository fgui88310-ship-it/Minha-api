// api/endpoints/instagramstalker.js
import express from "express";
import { fetchInstagramProfile } from "../../【 SCRAPERS 】/instagramService.js";
import { saveToJson } from "../../【 UTILS 】/fileUtils.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { username } = req.query;

  if (!username)
    return res.status(400).json({ error: "Passe ?username=" });

  try {
    const data = await fetchInstagramProfile(username);

    if (!data)
      return res.status(404).json({ error: "Perfil não encontrado" });

    await saveToJson(`perfil_${username}.json`, data);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;