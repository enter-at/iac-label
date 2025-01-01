import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: ["src/**/*.ts"],
    coverageDirectory: "test-reports/coverage",
    reporters: ["default"],
    testMatch: ["**/*.spec.ts"],
};
// noinspection JSUnusedGlobalSymbols
export default config;
