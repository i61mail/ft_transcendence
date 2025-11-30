import { PongGame } from 'pong/gameLogic';
import { fastify } from '../server';
import { playerInfo } from './interfaces';
import { GameMode } from 'pong/interfaces';
import { platform } from 'os';

enum trnmtStatus
{
    waiting,
    startingSemi,
    playingSemi,
    startingFinal,
    playingFinal,
}

interface Match {
  player1: string;
  player2: string;
  winner: 'player1' | 'player2' | null;
}

interface TournamentData {
  status: string;
  semiFinals: Match[];
  final: Match;
}

class Tournament
{
    players: Map<number, playerInfo> = new Map<number, playerInfo>;
    game1!: PongGame;
    game2!: PongGame;
    finaleGame!: PongGame;
    status: trnmtStatus = trnmtStatus.waiting;
    tournamentData: TournamentData =
    {
        status: this.statusString,
        semiFinals: [
        {
            player1: "-",
            player2: "-",
            winner: null
        },
        {
            player1: "-",
            player2: "-",
            winner: null
        }
        ],
        final: {
            player1: "-",
            player2: "-",
            winner: null
        }
    };
    
    addPlayer(player: playerInfo): boolean
    {
        if (this.status != trnmtStatus.waiting)
            return (false);
        let rand: number = Math.random() % 4;
        for (; this.players.has(rand); rand = (rand + 1) % 4);
        this.players.set(rand, player);
        this.playerName = rand;
        this.broadcastTournamentData();
        if (this.players.size == 4)
        {
            this.status = trnmtStatus.startingSemi;
            setTimeout(this.startSemiGame, 3000);
        }
        return (true);
    }
    
    set playerName(pos: number)
    {
        switch (pos)
        {
            case 0:
                this.tournamentData.semiFinals[0].player1 = "get first player username";
                break;
            case 1:
                this.tournamentData.semiFinals[0].player2 = "get second player username";
                break;
            case 2:
                this.tournamentData.semiFinals[1].player1 = "get third player username";
                break;
            case 3:
                this.tournamentData.semiFinals[1].player2 = "get forth player username";
                break;
        }
    }

    get statusString(): string
    {
        switch (this.status)
        {
            case trnmtStatus.waiting:
                return ("Waiting for Players");
            case trnmtStatus.startingSemi:
                return ("Starting Semi-Finals");
            case trnmtStatus.playingSemi:
                return ("Playing Semi-Finals");
            case trnmtStatus.startingFinal:
                return ("Starting Final Match");
            case trnmtStatus.playingFinal:
                return ("Playing Final Match");
            default:
                return ("Unknown Status");
        }
    }

    // intervalFunc(game: PongGame, player1: playerInfo, player2: playerInfo, intervalId: NodeJS.Timeout, pos: number)
    intervalFunc(winner: number, )
    {
        if (winner == 0)
            return ;
        const winnerS: string = 'player' + winner.toString();
        this.tournamentData.semiFinals[pos - 4].winner = winnerS;
        if (winner == 1)
        {
            this.players.set(pos, player1);
            
        }
        else
        {
            this.players.set(pos, player2);
            this.tournamentData.semiFinals[pos - 4].winner = 'player2';
        }
        clearInterval(intervalId);
    }

    startSemiGame()
    {
        this.status = trnmtStatus.playingSemi;
        this.game1 = new PongGame(GameMode.online, this.players.get(0)!, this.players.get(1)!);
        this.game2 = new PongGame(GameMode.online, this.players.get(2)!, this.players.get(3)!);
        const intervalId1: NodeJS.Timeout = setInterval(()=>
        {
            // this.intervalFunc(this.game1, this.players.get(0)!, this.players.get(1)!, intervalId1, 4);
            this.intervalFunc( this.game1.winner);
        }, 1000);
        const intervalId2: NodeJS.Timeout = setInterval(()=>
        {
            this.intervalFunc(this.game2, this.players.get(2)!, this.players.get(3)!, intervalId2, 5);
        }, 1000);
        const intervalId3: NodeJS.Timeout = setInterval(() =>
        {
            if (this.players.size == 6)
            {
                setTimeout(this.startFinaleGame, 3000);
                clearInterval(intervalId3);
            }
        });
    }

    startFinaleGame()
    {
        this.finaleGame = new PongGame(GameMode.online, this.players.get(4)!, this.players.get(5)!);
        const intervalId: NodeJS.Timeout = setInterval(()=>
        {
            if (this.finaleGame.winner == 0)
                return ;
            if (this.finaleGame.winner == 1)
            {
                this.players.set(6, this.players.get(4)!);
                this.tournamentData.final.winner = 'player1';
            }
            else
            {
                this.players.set(6, this.players.get(5)!);
                this.tournamentData.final.winner = 'player2';
            }
            clearInterval(intervalId);
        }, 1000);
    }

    broadcastTournamentData()
    {
        const data: string = JSON.stringify(this.tournamentData);

        this.players.forEach((player: playerInfo) =>
        {
            player.socket.send(data);
        });
    }
}

const tournaments: Map<string, Tournament> = new Map<string, Tournament>();

function generateCode(): string
{
    const characters: string = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const length: number = 6;
    let code: string = '';
    
    for (let i = 0; i < length; i++)
    {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    console.log(code);
    if (tournaments.has(code))
        return (generateCode())
    return (code);
}

export function startTournament(host: playerInfo | null = null)
{
    const code: string = generateCode();

    tournaments.set(code, new Tournament());
    joinTournament(host!, code);
}

export function joinTournament(player: playerInfo, code: string) // maybe return true or false to show that is not possible to join
{
    if (!tournaments.has(code))
        console.log("tournament doesnt exist");
    else if (!tournaments.get(code)?.addPlayer(player))
        console.log("tournament already started");
    else
        console.log("tournament joined succefuly");
}