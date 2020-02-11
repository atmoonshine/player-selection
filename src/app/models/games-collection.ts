export interface GamesCollection {
    games: Game[];
}

export interface Game {
    platform: string;
    imageUrl: string;
    command: {
      type: 'ipc' | 'route'
      arguments: string[];
    };
}
