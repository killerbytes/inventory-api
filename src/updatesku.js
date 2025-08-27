const { getSKU, shortenTitleTo } = require("./utils");
const productCombinationService = require("./services/productCombination.service");

async function main() {
  const product = await productCombinationService.getByProductId(2);
  const res = await productCombinationService.updateByProductId(2, product);
  console.log(res);
}

main();
