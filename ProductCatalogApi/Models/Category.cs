using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductCatalogApi.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        // Navigation property
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }

    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [StringLength(50)]
        public string Unit { get; set; } = "יח׳";

        [StringLength(1000)]
        public string? Description { get; set; }

        // Foreign key
        [Required]
        public int CategoryId { get; set; }

        // Navigation property
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;
    }
}

// DTOs for API responses
namespace ProductCatalogApi.DTOs
{
    /// <summary>
    /// Data Transfer Object for Category information
    /// </summary>
    public class CategoryDto
    {
        /// <summary>
        /// Category unique identifier
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        /// <example>פירות וירקות</example>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Category description
        /// </summary>
        /// <example>מוצרים טריים ואיכותיים</example>
        public string? Description { get; set; }

        /// <summary>
        /// List of products in this category
        /// </summary>
        public List<ProductDto> Products { get; set; } = new();
    }

    /// <summary>
    /// Data Transfer Object for Product information
    /// </summary>
    public class ProductDto
    {
        /// <summary>
        /// Product unique identifier
        /// </summary>
        /// <example>1</example>
        public int Id { get; set; }

        /// <summary>
        /// Product name
        /// </summary>
        /// <example>תפוחים</example>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Product price per unit
        /// </summary>
        /// <example>8.90</example>
        public decimal Price { get; set; }

        /// <summary>
        /// Unit of measurement
        /// </summary>
        /// <example>ק״ג</example>
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// Product description
        /// </summary>
        /// <example>תפוחים טריים ואיכותיים</example>
        public string? Description { get; set; }

        /// <summary>
        /// Category identifier
        /// </summary>
        /// <example>1</example>
        public int CategoryId { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        /// <example>פירות וירקות</example>
        public string CategoryName { get; set; } = string.Empty;
    }
}