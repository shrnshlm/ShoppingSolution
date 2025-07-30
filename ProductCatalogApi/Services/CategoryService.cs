
using ProductCatalogApi.Models;
using ProductCatalogApi.Repositories;

namespace ProductCatalogApi.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(
            ICategoryRepository categoryRepository,
            ICacheService cacheService,
            ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            const string cacheKey = "all_categories";
            var cachedCategories = await _cacheService.GetAsync<IEnumerable<Category>>(cacheKey);

            if (cachedCategories != null)
                return cachedCategories;

            var categories = await _categoryRepository.GetAllAsync();
            await _cacheService.SetAsync(cacheKey, categories, TimeSpan.FromMinutes(30));

            return categories;
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            var createdCategory = await _categoryRepository.AddAsync(category);
            await _cacheService.RemoveAsync("all_categories");

            _logger.LogInformation("Category created: {CategoryName}", category.Name);
            return createdCategory;
        }

        public async Task<Category?> UpdateCategoryAsync(int id, Category category)
        {
            if (!await _categoryRepository.ExistsAsync(id))
                return null;

            category.Id = id;
            var updatedCategory = await _categoryRepository.UpdateAsync(category);
            await _cacheService.RemoveAsync("all_categories");

            return updatedCategory;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var deleted = await _categoryRepository.DeleteAsync(id);
            if (deleted)
            {
                await _cacheService.RemoveAsync("all_categories");
                _logger.LogInformation("Category deleted: {CategoryId}", id);
            }
            return deleted;
        }
    }
}