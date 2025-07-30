
using ProductCatalogApi.Models;

namespace ProductCatalogApi.Services
{
    public class PriceCalculationService : IPriceCalculationService
    {
        public decimal CalculateDiscountedPrice(Product product, decimal discountPercentage)
        {
            if (discountPercentage < 0 || discountPercentage > 100)
                throw new ArgumentException("Discount percentage must be between 0 and 100");

            return product.Price * (1 - discountPercentage / 100);
        }

        public decimal CalculateTotalPrice(IEnumerable<Product> products, Dictionary<int, int> quantities)
        {
            decimal total = 0;
            foreach (var product in products)
            {
                if (quantities.TryGetValue(product.Id, out int quantity))
                {
                    total += product.Price * quantity;
                }
            }
            return total;
        }

        public decimal CalculateVat(decimal price, decimal vatRate = 0.17m)
        {
            return price * vatRate;
        }
    }
}