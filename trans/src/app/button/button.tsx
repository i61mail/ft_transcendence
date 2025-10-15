interface Props { label: string}

export function Button({ label }: Props) {
    return <button className="bg-green-500 text-blue p-2">{label}</button>
}