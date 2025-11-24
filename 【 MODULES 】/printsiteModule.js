const PrintsiteModule = {
  screenshotUrl(site) {
    return `https://image.thum.io/get/fullpage/${encodeURI(site)}`;
  }
};

export default PrintsiteModule;