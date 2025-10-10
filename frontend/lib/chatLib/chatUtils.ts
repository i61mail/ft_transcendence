import { MessageProps } from "@/types/common.types";

export const createFilteredCopyOfMessages = (data:MessageProps[], filter:string) =>
{
    let copy:MessageProps[] = [...data];
    copy = copy.filter((data)=>(data.receiver === filter || data.sender === filter));
    return (copy.reverse());
}


