using ProductCatalogApi.Models;

namespace ProductCatalogApi.Services
{
    public interface IPriceCalculationService
    {
        decimal CalculateDiscountedPrice(Product product, decimal discountPercentage);
        decimal CalculateTotalPrice(IEnumerable<Product> products, Dictionary<int, int> quantities);
        decimal CalculateVat(decimal price, decimal vatRate = 0.17m);
    }
}