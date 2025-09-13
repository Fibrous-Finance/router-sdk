import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // Global ignores
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**", 
            "**/build/**",
            "**/*.js.map",
            "**/*.d.ts",
            "babel.config.js",
            "**/coverage/**",
            "**/.DS_Store",
            "**/pnpm-lock.yaml",
            "**/package-lock.json",
            "**/yarn.lock",
        ],
    },

    // Base configurations - very relaxed
    js.configs.recommended,

    // TypeScript files - minimal and flexible approach
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: false, // Disable project service for performance
                ecmaVersion: 2022,
                sourceType: "module",
            },
        },
        rules: {
            // Only essential rules - very permissive
            "@typescript-eslint/no-unused-vars": "off", // Allow unused vars
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn", // Warn about any type usage
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/prefer-optional-chain": "off",
            "@typescript-eslint/consistent-type-imports": "off",
            
            // General rules - minimal enforcement
            "no-console": "off", // Allow console logs everywhere
            "prefer-const": "off", // Allow let instead of const
            "no-var": "warn", // Only warn about var usage
            "no-undef": "off", // TypeScript handles this
            "no-unused-vars": "off", // Let TypeScript handle this
            
            // Disable other potential strict rules
            "no-empty": "off",
            "no-constant-condition": "off",
            "no-unreachable": "off",
        },
    },

    // Disable type checking for JS files completely
    {
        files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
        rules: {
            // Minimal rules for JS files
            "no-undef": "off",
            "no-unused-vars": "off",
        },
    },

    // Examples - completely relaxed
    {
        files: ["examples/**/*.ts", "examples/**/*.js"],
        rules: {
            // Turn off everything for examples
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "no-console": "off",
            "prefer-const": "off",
            "no-var": "off",
        },
    },

    // Tests - completely relaxed for testing flexibility
    {
        files: ["tests/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
        rules: {
            // Turn off everything for tests
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "no-console": "off",
            "prefer-const": "off",
            "no-var": "off",
        },
    },
);

