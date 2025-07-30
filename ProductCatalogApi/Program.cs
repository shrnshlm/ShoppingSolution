using ProductCatalogApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Register all services using extension methods
builder.Services
    .AddDatabaseServices(builder.Configuration)
    .AddRepositories()
    .AddBusinessServices()
    .AddCachingServices()
    .AddCustomControllers()
    .AddSwaggerServices()
    .AddCorsServices()
    .AddLoggingServices();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwaggerInDevelopment(app.Environment);
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Initialize database
app.UseDatabaseSeeding();

app.Run();