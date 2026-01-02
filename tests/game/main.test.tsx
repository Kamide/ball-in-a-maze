import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Game } from "../../src/game/main.tsx";

describe("game main component", () => {
  it("renders without crashing", () => {
    render(<Game />);
  });
});
