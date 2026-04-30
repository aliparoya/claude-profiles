import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export interface Deck {
  title: string;
  description?: string;
  image: string;
  href: string;
}

interface DeckLibraryProps {
  decks: Deck[];
}

interface DeckCardProps {
  deck: Deck;
}

function DeckCard({ deck }: DeckCardProps): JSX.Element {
  const imageUrl = useBaseUrl(deck.image);
  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea
        component={Link}
        to={deck.href}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl}
          alt={deck.title}
          sx={{ aspectRatio: "16 / 9", objectFit: "cover" }}
        />
        <CardContent>
          <Typography variant="h6" component="div">
            {deck.title}
          </Typography>
          {deck.description ? (
            <Typography variant="body2" color="text.secondary">
              {deck.description}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function DeckLibrary({
  decks,
}: DeckLibraryProps): JSX.Element {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 3,
        mt: 3,
      }}
    >
      {decks.map((deck) => (
        <DeckCard key={deck.href} deck={deck} />
      ))}
    </Box>
  );
}
