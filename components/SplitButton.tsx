import Button, { ButtonProps } from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import React, { Fragment, Ref, useRef, useState } from "react";

export interface SplitButtonProps {
  open?: boolean;
  selectedIndex?: number;
  options: string[];
  onClick?: (index: number, option: string) => void;
  cypressData?: string;
  ref?: Ref<any>;
}

export default function SplitButton(props: SplitButtonProps & ButtonProps) {
  const [open, setOpen] = useState(props.open || false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(props.selectedIndex || 0);

  const handleClick = () => {
    if (props.onClick) {
      props.onClick(selectedIndex, props.options[selectedIndex]);
    }
  };

  const handleMenuItemClick = (event: any, index: number) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      (anchorRef.current as any).contains(event.target)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <Fragment>
      <ButtonGroup variant="contained" ref={anchorRef}>
        <Button
          {...props}
          onClick={handleClick}
          data-cy={props.cypressData}
          ref={props.ref}
        >
          {props.options[selectedIndex]}
        </Button>
        <Button {...props} size="small" onClick={handleToggle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {props.options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                      sx={{ display: "flex" }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Fragment>
  );
}
