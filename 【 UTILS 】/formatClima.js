export function formatClimaData(data, cidade) {
  const current = data.current_condition?.[0];
  const area = data.nearest_area?.[0];

  if (!current || !area) throw new Error('Dados de clima indisponíveis.');

  return {
    cidade: area.areaName[0]?.value,
    regiao: area.region[0]?.value,
    pais: area.country[0]?.value,
    temperatura_C: current.temp_C,
    temperatura_F: current.temp_F,
    sensacao_C: current.FeelsLikeC,
    sensacao_F: current.FeelsLikeF,
    descricao: current.weatherDesc[0]?.value,
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
    imagem: `https://wttr.in/${encodeURIComponent(cidade)}.png`,
  };
}