using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Data;
using Repositories.Interfaces;
using Repositories.Implementations;
using Services.Interfaces;
using Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

// Repositories
builder.Services.AddScoped<ISuKienRepository, SuKienRepository>();
builder.Services.AddScoped<ICheckInRepository, CheckInRepository>();
builder.Services.AddScoped<ILoaiVeRepository, LoaiVeRepository>();
builder.Services.AddScoped<IVeRepository, VeRepository>();
builder.Services.AddScoped<IDonHangRepository, DonHangRepository>();
builder.Services.AddScoped<IBaoCaoRepository, BaoCaoRepository>();
builder.Services.AddScoped<IThongBaoRepository, ThongBaoRepository>();

// Services
builder.Services.AddScoped<ISuKienService, SuKienService>();
builder.Services.AddScoped<ICheckInService, CheckInService>();
builder.Services.AddScoped<ILoaiVeService, LoaiVeService>();
builder.Services.AddScoped<IVeService, VeService>();
builder.Services.AddScoped<IDonHangService, DonHangService>();
builder.Services.AddScoped<IBaoCaoService, BaoCaoService>();
builder.Services.AddScoped<IThongBaoService, ThongBaoService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
