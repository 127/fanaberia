import { IconProps } from "~/utils/utils.common";

/**
 * Renders UserIcon component
 * @param params svg element attributes
 * @returns JSX.Element
 */
export const UserIcon = ({
  fill = "currentColor",
  width = 20,
  height = 20,
  ...rest
}: IconProps): JSX.Element => {
  return (
    <svg
      enableBackground="new 0 0 50 50"
      id="Layer_1"
      version="1.1"
      viewBox="0 0 50 50"
      width={width}
      height={height}
      fill={fill}
      {...rest}
    >
      <circle
        cx="25"
        cy="25"
        fill="none"
        r="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
      <rect fill="none" height="50" width="50" />
      <path d="M29.933,35.528c-0.146-1.612-0.09-2.737-0.09-4.21c0.73-0.383,2.038-2.825,2.259-4.888c0.574-0.047,1.479-0.607,1.744-2.818  c0.143-1.187-0.425-1.855-0.771-2.065c0.934-2.809,2.874-11.499-3.588-12.397c-0.665-1.168-2.368-1.759-4.581-1.759  c-8.854,0.163-9.922,6.686-7.981,14.156c-0.345,0.21-0.913,0.878-0.771,2.065c0.266,2.211,1.17,2.771,1.744,2.818  c0.22,2.062,1.58,4.505,2.312,4.888c0,1.473,0.055,2.598-0.091,4.21c-1.261,3.39-7.737,3.655-11.473,6.924  c3.906,3.933,10.236,6.746,16.916,6.746s14.532-5.274,15.839-6.713C37.688,39.186,31.197,38.93,29.933,35.528z" />
    </svg>
  );
};
