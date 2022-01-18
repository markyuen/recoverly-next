import React from "react";
import Image from "next/image";
import LinkContainer from "../Common/LinkContainer";
import { generateItemSlugLink } from "../../lib/string";

type ItemProp = {
  category: string;
  description: string;
  id: number;
  image: string;
  price: number;
  title: string;
  rating: {
    rate: number;
    count: number;
  };
};

type ItemCardProp = {
  item: ItemProp;
};

const ItemCard = ({ item }: ItemCardProp) => {
  const { title, price, image, id } = item;

  return (
    <LinkContainer href={`/product/${id}`}>
      <div className="card flex flex-col justify-center ">
        <div className="px-4 py-10 mx-auto">
          <Image src={image} width={200} height={200} alt={title} />
        </div>
        <p className="text-md uppercase text-gray-900 font-bold">{title}</p>
        <p className="text-sm text-left">{price}</p>
      </div>
    </LinkContainer>
  );
};

export default ItemCard;
