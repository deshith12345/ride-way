
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

export default function SearchWidget() {
    const router = useRouter()
    const [cities, setCities] = React.useState<{ value: string, label: string }[]>([])
    const [date, setDate] = React.useState<string>("")
    const [openOrigin, setOpenOrigin] = React.useState(false)
    const [openDest, setOpenDest] = React.useState(false)
    const [origin, setOrigin] = React.useState("")
    const [destination, setDestination] = React.useState("")

    React.useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch('/api/locations')
                const data = await res.json()
                if (Array.isArray(data)) setCities(data)
            } catch (err) {
                console.error("Failed to fetch cities:", err)
            }
        }
        fetchCities()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (origin) params.set("from", cities.find(c => c.value === origin)?.label || origin)
        if (destination) params.set("to", cities.find(c => c.value === destination)?.label || destination)
        if (date) params.set("date", date)

        router.push(`/search?${params.toString()}`)
    }

    return (
        <Card className="w-full max-w-4xl soft-shadow-lg border-slate-200 bg-white mx-auto">
            <CardContent className="p-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Origin */}
                    <div className="md:col-span-3 space-y-2 text-left">
                        <label className="text-sm font-medium text-slate-700 ml-1">From</label>
                        <Popover open={openOrigin} onOpenChange={setOpenOrigin}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openOrigin}
                                    className="w-full justify-between border-slate-300 hover:border-blue-400 h-11"
                                >
                                    <div className="flex items-center truncate">
                                        <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                                        {origin
                                            ? cities.find((city) => city.value === origin)?.label
                                            : "Select city"}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search city..." />
                                    <CommandList>
                                        <CommandEmpty>No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {cities.map((city) => (
                                                <CommandItem
                                                    key={city.value}
                                                    value={city.value}
                                                    onSelect={(currentValue) => {
                                                        setOrigin(currentValue === origin ? "" : currentValue)
                                                        setOpenOrigin(false)
                                                    }}
                                                >
                                                    {city.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-3 space-y-2 text-left">
                        <label className="text-sm font-medium text-slate-700 ml-1">To</label>
                        <Popover open={openDest} onOpenChange={setOpenDest}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openDest}
                                    className="w-full justify-between border-slate-300 hover:border-blue-400 h-11"
                                >
                                    <div className="flex items-center truncate">
                                        <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                                        {destination
                                            ? cities.find((city) => city.value === destination)?.label
                                            : "Select city"}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search city..." />
                                    <CommandList>
                                        <CommandEmpty>No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {cities.map((city) => (
                                                <CommandItem
                                                    key={city.value}
                                                    value={city.value}
                                                    onSelect={(currentValue) => {
                                                        setDestination(currentValue === destination ? "" : currentValue)
                                                        setOpenDest(false)
                                                    }}
                                                >
                                                    {city.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-3 space-y-2 text-left">
                        <label className="text-sm font-medium text-slate-700 ml-1">Date</label>
                        <Input
                            type="date"
                            className="w-full justify-start text-left font-normal border-slate-300 hover:border-blue-400 h-11"
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Passengers */}
                    <div className="md:col-span-2 space-y-2 text-left">
                        <label className="text-sm font-medium text-slate-700 ml-1">Seats</label>
                        <Select defaultValue="1">
                            <SelectTrigger className="border-slate-300 hover:border-blue-400 h-11">
                                <SelectValue placeholder="Seats" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-1">
                        <Button className="w-full gradient-primary text-white hover:shadow-lg transition-all h-11" type="submit">
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    )
}
