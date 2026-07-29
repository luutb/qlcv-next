"use client";

import Link from "next/link";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export function PlaceholderPage({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
          {actionHref && actionLabel ? (
            <Button component={Link} href={actionHref} variant="contained" sx={{ alignSelf: "flex-start" }}>
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
