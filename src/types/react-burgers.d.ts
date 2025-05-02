declare module "react-burgers" {
  import { Component } from "react";

  interface SliderProps {
    active: boolean;
    onClick?: () => void;
    color?: string;
    width?: number;
    lineHeight?: number;
    borderRadius?: number;
    padding?: number;
  }

  export class Slider extends Component<SliderProps> { }
}
