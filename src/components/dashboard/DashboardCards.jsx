import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';

const DashboardCards = ({ cards, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Box sx={{ height: 80, bgcolor: 'action.hover', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {card.value}
                  </Typography>
                  {card.trend && (
                    <Chip
                      label={card.trend}
                      size="small"
                      color={card.trend.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;