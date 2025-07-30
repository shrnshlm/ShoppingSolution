using ProductCatalogApi.Models;
using ProductCatalogApi.Repositories;

namespace ProductCatalogApi.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IProductValidationService _validationService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IProductRepository productRepository,
            IProductValidationService validationService,
            ICacheService cacheService,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository;
            _validationService = validationService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            const string cacheKey = "all_products";
            var cachedProducts = await _cacheService.GetAsync<IEnumerable<Product>>(cacheKey);

            if (cachedProducts != null)
                return cachedProducts;

            var products = await _productRepository.GetAllAsync();
            await _cacheService.SetAsync(cacheKey, products, TimeSpan.FromMinutes(10));

            return products;
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _productRepository.GetByCategoryIdAsync(categoryId);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            if (!await _validationService.IsValidProductAsync(product))
                throw new ArgumentException("Invalid product data");

            var createdProduct = await _productRepository.AddAsync(product);
            await _cacheService.RemoveAsync("all_products");

            _logger.LogInformation("Product created: {ProductName}", product.Name);
            return createdProduct;
        }

        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            if (!await _productRepository.ExistsAsync(id))
                return null;

            if (!await _validationService.IsValidProductAsync(product))
                throw new ArgumentException("Invalid product data");

            product.Id = id;
            var updatedProduct = await _productRepository.UpdateAsync(product);
            await _cacheService.RemoveAsync("all_products");

            return updatedProduct;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var deleted = await _productRepository.DeleteAsync(id);
            if (deleted)
            {
                await _cacheService.RemoveAsync("all_products");
                _logger.LogInformation("Product deleted: {ProductId}", id);
            }
            return deleted;
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
        {
            return await _productRepository.SearchAsync(searchTerm);
        }
    }
}