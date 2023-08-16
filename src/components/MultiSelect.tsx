import { ComponentProps, useState } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { Input, InputDisabled, InputInvalid } from "./base";
import { autoUpdate, size, useFloating } from "@floating-ui/react";
import Spinner from "./Spinner";
import Chip from "./Chip";
import useSelectCursor from "../hooks/useSelectCursor";

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  onOptionSelected?: (option: string) => void;
  isLoading?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  value: (string | { custom: string })[];
  setValue: (value: (string | { custom: string })[]) => void;
  allowCustomOptions?: boolean;
} & Omit<ComponentProps<"input">, "value">;

function getLabel(option: string | Option | { custom: string }): string {
  if (typeof option === "string") {
    return option;
  }
  if ("custom" in option) {
    return option.custom;
  }
  return option.label;
}

function getValue(option: string | Option | { custom: string }): string {
  if (typeof option === "string") {
    return option;
  }
  if ("custom" in option) {
    return option.custom;
  }
  return option.value;
}

export default function MultiSelect({
  value,
  setValue,
  onOptionSelected,
  options,
  isLoading,
  className,
  placeholder,
  invalid,
  disabled,
  allowCustomOptions,
  onBlur,
  onFocus,
  ...rest
}: Props) {
  const [untrimedSearch, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const search = untrimedSearch.trim();

  const selected = value
    // TODO: O(n^2)
    .map((selectedOption) =>
      typeof selectedOption === "string"
        ? options.find((option) => option.value === selectedOption)
        : selectedOption
    )
    .filter((x) => x) as (Option | { custom: string })[];

  const filteredOptions = options.filter((option) => {
    const label = getLabel(option);
    const value = getValue(option);

    return (
      (!search || label.toLowerCase().includes(search.toLowerCase())) &&
      !selected.find((option) => getValue(option) === value)
    );
  });

  const customOptions = (
    value.filter((option) => typeof option !== "string") as { custom: string }[]
  ).map(({ custom }) => custom);

  const exactMatch = options
    .map((option) => option.label)
    .concat(customOptions)
    .find((option) => option.toLowerCase() === search.toLowerCase());

  const showCreateButton = allowCustomOptions && search && !exactMatch;

  const { refs, floatingStyles } = useFloating({
    open: focused,
    placement: "bottom-start",
    middleware: [
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const {
    cursor,
    optionRefs,
    setCursor,
    onInputKeyDown: inputKeyDownCursorHandler,
  } = useSelectCursor(filteredOptions.length + (showCreateButton ? 1 : 0));

  function createCustomOption() {
    if (!search) {
      return;
    }
    setSearch("");
    if (allowCustomOptions) {
      setValue([...value, { custom: search }]);
      onOptionSelected?.(search);
    }
  }

  function toggleSelection(option: string) {
    setSearch("");
    if (value.includes(option)) {
      setValue(value.filter((otherOption) => otherOption !== option));
    } else {
      setValue([...value, option]);
      onOptionSelected?.(option);
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    inputKeyDownCursorHandler(e);

    if (e.code === "Enter") {
      e.preventDefault();
      if (cursor >= filteredOptions.length && showCreateButton) {
        createCustomOption();
      } else if (cursor >= 0 && filteredOptions.length > 0) {
        const option = filteredOptions[cursor];

        toggleSelection(getValue(option));
        setSearch("");
      }
    } else if (e.code === "Backspace" && search === "") {
      setValue(value.slice(0, value.length - 1));
    }
  }

  return (
    <div
      className={twMerge(
        Input,
        invalid && InputInvalid,
        disabled && InputDisabled,
        "flex",
        focused && "outline-none ring-1 ring-blue-500 border-blue-500",
        className
      )}
      ref={refs.setReference}
    >
      <div className="flex flex-wrap flex-1 items-center">
        {selected.map((option) => (
          <Chip
            delectable
            className="mr-2"
            key={"custom" in option ? option.custom : option.value}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onDelete={() =>
              setValue(
                value.filter(
                  (otherOption) => getValue(otherOption) !== getValue(option)
                )
              )
            }
          >
            {getLabel(option)}
          </Chip>
        ))}
        <input
          {...rest}
          type="text"
          placeholder={value && !placeholder ? "" : placeholder}
          value={untrimedSearch}
          className="flex-1 outline-none bg-transparent w-fit"
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => {
            onFocus?.(e);
            setFocused(true);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            setFocused(false);
          }}
          onKeyDown={onInputKeyDown}
          size={untrimedSearch.length + 1}
          disabled={disabled}
        />
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="self-center ml-auto w-6 h-6 text-gray-500 cursor-pointer"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
      {focused && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="max-h-64 overflow-y-auto rounded-lg shadow mt-2 text-black bg-white z-10"
        >
          {isLoading ? (
            <div className="text-center w-full py-3">
              <Spinner className="m-auto" />
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => {
                return (
                  <div
                    tabIndex={0}
                    key={getValue(option)}
                    className={twJoin(
                      "px-2 p-1 cursor-pointer hover:bg-gray-100",
                      cursor === index && "bg-gray-100"
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleSelection(getValue(option));
                    }}
                    onMouseEnter={() => setCursor(index)}
                    ref={(el) => (optionRefs.current[index] = el)}
                  >
                    {getLabel(option)}
                  </div>
                );
              })}
              {showCreateButton && (
                <div
                  className={twJoin(
                    "px-2 p-1 cursor-pointer hover:bg-gray-100",
                    cursor === filteredOptions.length && "bg-gray-100"
                  )}
                  onMouseDown={createCustomOption}
                  onMouseEnter={() => setCursor(filteredOptions.length)}
                  ref={(el) =>
                    (optionRefs.current[filteredOptions.length] = el)
                  }
                >
                  <span className="text-gray-500">Create</span> {search}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
