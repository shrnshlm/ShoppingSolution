using ProductCatalogApi.Models;

namespace ProductCatalogApi.Services
{
    public interface IProductValidationService
    {
        Task<bool> IsValidProductAsync(Product product);
        Task<List<string>> ValidateProductAsync(Product product);
        bool IsValidPrice(decimal price);
        bool IsValidName(string name);
    }
}