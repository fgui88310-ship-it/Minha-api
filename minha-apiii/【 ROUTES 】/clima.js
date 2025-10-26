// api/endpoints/clima.js
import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/', async (req, res, next) => {
  const { cidade } = req.query;
  if (!cidade) return res.status(400).json({ error: 'Passe ?cidade=NomeDaCidade' });

  try {
    const wttrin = (await axios.get(`https://wttr.in/${encodeURIComponent(cidade)}?format=j1`)).data;

    const current = wttrin.current_condition[0];
    const area = wttrin.nearest_area[0];

    res.json({
      cidade: area.areaName[0].value,
      regiao: area.region[0].value,
      pais: area.country[0].value,
      temperatura_C: current.temp_C,
      temperatura_F: current.temp_F,
      sensacao_C: current.FeelsLikeC,
      sensacao_F: current.FeelsLikeF,
      descricao: current.weatherDesc[0].value,
      umidade: current.humidity,
      vento_KMph: current.windspeedKmph,
      vento_Mph: current.windspeedMiles,
      direcao_vento: current.winddir16Point,
      pressao_hPa: current.pressure,
      pressao_inHg: current.pressureInches,
      visibilidade_KM: current.visibility,
      visibilidade_milhas: current.visibilityMiles,
      uvIndex: current.uvIndex,
      cloudcover: current.cloudcover,
      precip_mm: current.precipMM,
      precip_pol: current.precipInches,
      hora_observacao: current.observation_time,
      localObsDateTime: current.localObsDateTime,
      populacao: area.population,
      imagem: `https://wttr.in/${encodeURIComponent(cidade)}.png`
    });

  } catch (err) {
    next(err);
  }
});

export default router;