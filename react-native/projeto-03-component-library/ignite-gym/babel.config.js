module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@/domain/hooks": "./src/domain/hooks",
            "@/domain/models": "./src/domain/models",
            "@/domain/services": "./src/domain/services",
            "@/domain/storage": "./src/domain/storage",
            "@/domain/use_cases": "./src/domain/use_cases",
            "@/domain/utils": "./src/domain/utils",
            "@/domain/validations": "./src/domain/validations",
            "@/presentation/assets": "./src/presentation/assets",
            "@/presentation/components": "./src/presentation/components",
            "@/presentation/contexts": "./src/presentation/contexts",
            "@/presentation/navigation": "./src/presentation/navigation",
            "@/presentation/screens": "./src/presentation/screens",
            "@/presentation/theme": "./src/presentation/theme",
          },
        },
      ],
    ],
  };
};
