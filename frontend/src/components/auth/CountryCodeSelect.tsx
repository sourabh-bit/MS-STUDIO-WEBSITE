import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";

import { cn } from "@/lib/utils";
import { COUNTRIES, findCountry } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type CountryCodeSelectProps = {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
};

const CountryCodeSelect = ({ value, onChange }: CountryCodeSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = findCountry(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-[110px] shrink-0 justify-between px-2 font-normal"
        >
          <span className="flex items-center gap-1.5 truncate">
            <span>{selected?.flag}</span>
            <span>+{selected?.dialCode}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command
          filter={(itemValue, search) => (itemValue.includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.iso2}
                  value={`${country.name.toLowerCase()} ${country.dialCode} ${country.iso2.toLowerCase()}`}
                  onSelect={() => {
                    onChange(country.iso2);
                    setOpen(false);
                  }}
                  className={cn(country.iso2 === value && "bg-accent")}
                >
                  <span className="mr-2">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-muted-foreground">+{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelect;
