import { trnmtStatus, TournamentData } from '../types/tournaments.types';
import { GameMode } from '../types/pong.types';
import { PongGame } from './pong';
import { playerInfo } from '../types/playerInfo.types';
import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';

const tournaments: Map<string, Tournament> = new Map<string, Tournament>();

class Tournament
{
    players: Map<number, playerInfo> = new Map<number, playerInfo>();
    game1!: PongGame;
    game2!: PongGame;
    finaleGame!: PongGame;
    status: trnmtStatus = trnmtStatus.waiting;
    static server: FastifyInstance | null;
    tournamentData: TournamentData =
    {
        code: "",
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

    constructor(code: string)
    {
        this.tournamentData.code = code;
    }

    addPlayer(player: playerInfo): boolean
    {
        let doesExist: boolean = false;
        this.players.forEach((currPlayer: playerInfo) =>
        {
            if (player.id == currPlayer.id)
            {
                doesExist = true;
                currPlayer.socket = player.socket;
            }
        });
        if (doesExist) return (true);

        if (this.status != trnmtStatus.waiting)
            return (false);
        let rand: number = Math.floor(Math.random() * 4);
        for (; this.players.has(rand); rand = (rand + 1) % 4);
        this.players.set(rand, player);
        this.setPlayerName(rand, player.username);
        this.broadcastTournamentData();
        if (this.players.size == 4)
        {
            this.status = trnmtStatus.startingSemi;
            setTimeout(() => this.startSemiGame(), 3000);
        }
        return (true);
    }
    
    setPlayerName(pos: number, username: string)
    {
        switch (pos)
        {
            case 0:
                this.tournamentData.semiFinals[0].player1 = username;
                break;
            case 1:
                this.tournamentData.semiFinals[0].player2 = username;
                break;
            case 2:
                this.tournamentData.semiFinals[1].player1 = username;
                break;
            case 3:
                this.tournamentData.semiFinals[1].player2 = username;
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
            case trnmtStatus.finished:
                return ("Congratulations " + this.players.get(6)?.username + " !!")
            default:
                return ("Unknown Status");
        }
    }

    semiInterval(winner: number, player1: playerInfo, player2: playerInfo, intervalId: NodeJS.Timeout, pos: number)
    {
        if (winner == 0)
            return ;
        if (winner == 1)
        {
            this.players.set(pos, player1);
            this.tournamentData.semiFinals[pos - 4].winner = 'player1';
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
        this.game1 = new PongGame(GameMode.online, Tournament.server!, this.players.get(0)!, this.players.get(1)!);
        this.game2 = new PongGame(GameMode.online, Tournament.server!, this.players.get(2)!, this.players.get(3)!);
        const intervalId1: NodeJS.Timeout = setInterval(()=>
        {
            this.semiInterval(this.game1.winner, this.players.get(0)!, this.players.get(1)!, intervalId1, 4);
        }, 1000);
        const intervalId2: NodeJS.Timeout = setInterval(()=>
        {
            this.semiInterval(this.game2.winner, this.players.get(2)!, this.players.get(3)!, intervalId2, 5);
        }, 1000);
        const intervalId3: NodeJS.Timeout = setInterval(() =>
        {
            if (this.players.size == 6)
            {
                setTimeout(() => this.startFinaleGame(), 3000);
                clearInterval(intervalId3);
            }
        }, 1000);
    }

    startFinaleGame()
    {
        this.finaleGame = new PongGame(GameMode.online, Tournament.server!, this.players.get(4)!, this.players.get(5)!);
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
            this.broadcastTournamentData();

            clearInterval(intervalId);
        }, 1000);
    }

    broadcastTournamentData()
    {
        const data: string = JSON.stringify(this.tournamentData);

        console.log(this.tournamentData);
        this.players.forEach((player: playerInfo) =>
        {
            player.socket.send(data);
        });
    }
}

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

export function startTournament(host: playerInfo, server: FastifyInstance)
{
    const code: string = generateCode();

    if (Tournament.server == null)
        Tournament.server = server;
    tournaments.set(code, new Tournament(code));
    joinTournament(host, code);
}

export function joinTournament(player: playerInfo, code: string) // maybe return true or false to show that is not possible to join
{
    // player.socket.onmessage= () =>
    // {

    // };
    if (!tournaments.has(code))
        console.log("tournament doesnt exist");
    else if (!tournaments.get(code)?.addPlayer(player))
        console.log("tournament already started");
    else
        console.log("tournament joined succefuly");
}