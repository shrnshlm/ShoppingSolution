
using ProductCatalogApi.Models;

namespace ProductCatalogApi.Services
{
    public class ProductValidationService : IProductValidationService
    {
        public async Task<bool> IsValidProductAsync(Product product)
        {
            var errors = await ValidateProductAsync(product);
            return !errors.Any();
        }

        public async Task<List<string>> ValidateProductAsync(Product product)
        {
            var errors = new List<string>();

            if (!IsValidName(product.Name))
                errors.Add("Product name is required and must be between 1 and 100 characters");

            if (!IsValidPrice(product.Price))
                errors.Add("Product price must be greater than 0");

            if (product.CategoryId <= 0)
                errors.Add("Valid category is required");

            if (string.IsNullOrWhiteSpace(product.Unit))
                errors.Add("Unit is required");

            return await Task.FromResult(errors);
        }

        public bool IsValidPrice(decimal price)
        {
            return price > 0 && price <= 99999.99m;
        }

        public bool IsValidName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.Length <= 100;
        }
    }
}