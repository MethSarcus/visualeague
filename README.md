## Visualeague
Visualeague is a site for visualizing the data of fantasy leagues hosted on Sleeper.

This project uses [Next.js](https://nextjs.org/) with [Chakra UI](https://chakra-ui.com/) for the front end, [Nivo](https://nivo.rocks/) for data visualization and [MongoDB](https://www.mongodb.com/) for storing player projections, stats, and details. Stats for leagues are pulled using [Sleeper's API](https://docs.sleeper.com). If you have any feature requests or want to contribute feel free to open a PR or submit a feature request. 

This app uses the experimental features provided with [NextJS 13](https://nextjs.org/blog/next-13) so make sure to read up on those changes

## Getting Started

First create a .env.local file with the following content
```
MONGODB_URI=mongodb+srv://guest:etPwqpjM9oVcRFRc@cluster0.ertyk0m.mongodb.net/?retryWrites=true&w=majority
```

install npm packages and run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser



