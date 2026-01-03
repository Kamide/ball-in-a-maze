import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Game } from "../../src/game/main";

describe("Game", () => {
  it("renders without crashing", () => {
    render(<Game />);
  });
});
