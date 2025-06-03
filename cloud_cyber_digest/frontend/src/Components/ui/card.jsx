import * as React from "react";
import { cn } from "../../utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className, ...props }) => (
  <div className={cn("p-4 border-b", className)} {...props} />
);
const CardContent = ({ className, ...props }) => (
  <div className={cn("p-4", className)} {...props} />
);
const CardFooter = ({ className, ...props }) => (
  <div className={cn("p-4 border-t", className)} {...props} />
);

export { Card, CardHeader, CardContent, CardFooter };
