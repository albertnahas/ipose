import React from "react"
import { mount, shallow } from "enzyme"
import { HintButton } from "./HintButton"

describe("Hint Button", function () {
  console.error = jest.fn()

  it("renders without crashing", () => {
    shallow(<HintButton />)
  })

  it("disable the button when disabled is true", () => {
    const component = shallow(<HintButton disabled={true} />)
    expect(component.find(`[aria-label="hint button"]`).props()).toHaveProperty(
      "disabled"
    )
  })
  it("calls on click", async () => {
    const onClickMock = jest.fn()
    const component = mount(<HintButton onClick={onClickMock} />)
    component.find(`button`).simulate("click")
    component.update()
    expect(onClickMock).toBeCalled()
  })
})
