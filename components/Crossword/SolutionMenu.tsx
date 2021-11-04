import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export interface SolutionMenuProps {
  solutions?: string[];
  anchor?: HTMLElement | null;
  onSolutionSelected?: (solution: string) => void;
}

export function SolutionMenu(props: SolutionMenuProps) {
  return props.anchor ? (
    <Menu anchorEl={props.anchor} open={props.solutions != undefined}>
      {props.solutions?.map((solution, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            if (props.onSolutionSelected) {
              props.onSolutionSelected(solution);
            }
          }}
        >
          {solution}
        </MenuItem>
      ))}
    </Menu>
  ) : null;
}
