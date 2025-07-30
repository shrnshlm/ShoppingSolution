// Extensions/ApplicationBuilderExtensions.cs
using ProductCatalogApi.Data;
using ProductCatalogApi.Models;

namespace ProductCatalogApi.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseSwaggerInDevelopment(this IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Product Catalog API v1");
                    c.RoutePrefix = string.Empty; // Swagger at root
                });
            }

            return app;
        }

        public static IApplicationBuilder UseDatabaseSeeding(this IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProductCatalogContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                context.Database.EnsureCreated();

                if (!context.Categories.Any())
                {
                    logger.LogInformation("Seeding database with initial data...");
                    SeedData(context);
                    logger.LogInformation("Database seeded successfully");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
            }

            return app;
        }

        private static void SeedData(ProductCatalogContext context)
        {
            var categories = new[]
            {
                new Category { Name = "פירות וירקות", Description = "מוצרים טריים" },
                new Category { Name = "חלב וביצים", Description = "מוצרי חלב ביתיים" },
                new Category { Name = "בשר ודגים", Description = "חלבונים איכותיים" },
                new Category { Name = "לחמים ומאפים", Description = "מוצרי מאפייה טריים" },
                new Category { Name = "שימורים", Description = "מוצרים יבשים ושימורים" }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();

            var products = new[]
            {
                // פירות וירקות
                new Product { Name = "תפוחים", Price = 8.90m, CategoryId = 1, Unit = "ק״ג" },
                new Product { Name = "בננות", Price = 6.50m, CategoryId = 1, Unit = "ק״ג" },
                new Product { Name = "עגבניות", Price = 7.20m, CategoryId = 1, Unit = "ק״ג" },
                new Product { Name = "מלפפונים", Price = 5.80m, CategoryId = 1, Unit = "ק״ג" },
                
                // חלב וביצים
                new Product { Name = "חלב 3%", Price = 5.90m, CategoryId = 2, Unit = "ליטר" },
                new Product { Name = "ביצים", Price = 12.50m, CategoryId = 2, Unit = "יח׳ (30 ביצים)" },
                new Product { Name = "גבינה צהובה", Price = 25.90m, CategoryId = 2, Unit = "ק״ג" },
                new Product { Name = "יוגורט", Price = 4.20m, CategoryId = 2, Unit = "יח׳" },
                
                // בשר ודגים
                new Product { Name = "חזה עוף", Price = 35.90m, CategoryId = 3, Unit = "ק״ג" },
                new Product { Name = "בשר בקר טחון", Price = 45.90m, CategoryId = 3, Unit = "ק״ג" },
                new Product { Name = "פילה סלמון", Price = 89.90m, CategoryId = 3, Unit = "ק״ג" },
                
                // לחמים ומאפים
                new Product { Name = "לחם פרוס", Price = 6.80m, CategoryId = 4, Unit = "יח׳" },
                new Product { Name = "חלות שבת", Price = 8.50m, CategoryId = 4, Unit = "יח׳" },
                new Product { Name = "בייגלה", Price = 2.50m, CategoryId = 4, Unit = "יח׳" },
                
                // שימורים
                new Product { Name = "אורז", Price = 8.90m, CategoryId = 5, Unit = "ק״ג" },
                new Product { Name = "פסטה", Price = 4.50m, CategoryId = 5, Unit = "יח׳" },
                new Product { Name = "רוטב עגבניות", Price = 3.20m, CategoryId = 5, Unit = "יח׳" }
            };
            context.Products.AddRange(products);
            context.SaveChanges();
        }
    }
}