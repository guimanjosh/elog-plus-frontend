import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
  body: string;
  showEmptyLabel?: boolean;
}

/**
 * Renders an entry's body text with sanitization and prose styling
 */
export default function EntryBodyText({
  body,
  className,
  showEmptyLabel,
  ...rest
}: Props) {
  return (
    <div
      className={twMerge(
        className,
        "prose max-w-none overflow-x-auto",
        !body && "text-gray-500"
      )}
      dangerouslySetInnerHTML={
        !body && showEmptyLabel
          ? undefined
          : { __html: DOMPurify.sanitize(body) }
      }
      {...rest}
    >
      {!body && showEmptyLabel ? "No entry body" : undefined}
    </div>
  );
}
