import React from "react"
import { mount, shallow } from "enzyme"
import { ChallengeSetupDialog } from "./ChallengeSetupDialog"

describe("ChallengeSetupDialog modal", function () {
  console.error = jest.fn()
  const mockFn = jest.fn()

  it("renders without crashing", () => {
    const mockFn = jest.fn()
    shallow(<ChallengeSetupDialog open={true} onClose={mockFn} />)
  })

  it("has easy difficulty in the default setup", () => {
    const component = mount(
      <ChallengeSetupDialog open={true} onClose={mockFn} />
    )
    const input = component.find(`[aria-label="level"] input[checked=true]`)
    expect(input.prop("value")).toEqual(1)
  })

  it("has private mode in the default multiplayer setup", () => {
    const component = mount(
      <ChallengeSetupDialog
        open={true}
        onClose={mockFn}
        setup={{ players: 2 }}
      />
    )
    const button = component.find(`button[className*='contained']`)
    expect(button.text().toLowerCase()).toEqual("private")
  })

  it("has 2 players in the default multiplayer setup", () => {
    const component = mount(
      <ChallengeSetupDialog
        open={true}
        onClose={mockFn}
        setup={{ players: 2 }}
      />
    )
    expect(
      component.find(`[aria-label="players"] input`).prop("value")
    ).toEqual(2)
  })

  it("has 10 rounds in the default setup", () => {
    const component = mount(
      <ChallengeSetupDialog open={true} onClose={mockFn} />
    )
    const input = component.find(
      `[aria-label="rounds-controller"] input[checked=true]`
    )
    expect(input.prop("value")).toEqual(10)
  })

  it("shows custom rounds input when custom radio click", () => {
    const component = mount(
      <ChallengeSetupDialog open={true} onClose={mockFn} />
    )
    const radio = component.find(
      `[aria-label="rounds-controller"] input[value="custom"]`
    )
    radio.simulate("change", { target: { value: "custom" } })
    component.update()
    const input = component.find(`[aria-label="rounds"] input`)
    expect(input.prop("value")).toEqual(10)
  })
})
