# ProductCatalogApi Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ProductCatalogApi.csproj", "."]
RUN dotnet restore "./ProductCatalogApi.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "ProductCatalogApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProductCatalogApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create directory for SQLite database
RUN mkdir -p /app/Data

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "ProductCatalogApi.dll"]