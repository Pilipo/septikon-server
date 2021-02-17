import { Server } from 'boardgame.io/server';
import Septikon from './Game';

const server = Server({ games: [Septikon] });

server.run(8000);
