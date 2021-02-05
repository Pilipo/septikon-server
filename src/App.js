import { Client } from 'boardgame.io/client';
import { Septikon } from './Game';

class SeptikonClient {
    constructor(rootElement) {
      this.client = Client({ game: Septikon });
      this.client.start();
      this.rootElement = rootElement;
      this.createBoard();
      this.attachListeners();
      this.client.subscribe(state => this.update(state));
    }
  
    createBoard() {
      // Create cells in rows for the Tic-Tac-Toe board.
      const rows = [];
      for (let i = 0; i < 31; i++) {
        const cells = [];
        for (let j = 0; j < 21; j++) {
          const id = 21 * i + j;
          cells.push(`<td class="cell" data-id="${id}"></td>`);
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
      }
  
      // Add the HTML to our app <div>.
      // We’ll use the empty <p> to display the game winner later.
      this.rootElement.innerHTML = `
        <p class="selectedTile">pick a tile</p>
        <table>${rows.join('')}</table>
        <p class="winner"></p>
      `;
    }
  
    attachListeners() {
      // This event handler will read the cell id from a cell’s
      // `data-id` attribute and make the `clickCell` move.
      const handleCellClick = event => {
        const id = parseInt(event.target.dataset.id);
        this.client.moves.clickCell(id);
      };
      // Attach the event listener to each of the board cells.
      const cells = this.rootElement.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.onclick = handleCellClick;
      });
    }

    update(state) {
        // Get all the board cells.
        const cells = this.rootElement.querySelectorAll('.cell');
        const textField = this.rootElement.querySelectorAll('.selectedTile');
        // Update cells to display the values in game state.
        textField.textContent = state.G.clickedCell;
        // console.log(state.G.clickedCell);
        cells.forEach(cell => {
          const cellId = parseInt(cell.dataset.id);
          const cellValue = state.G.cells[cellId];
          cell.textContent = cellValue !== null ? cellValue : '';
        });
        // Get the gameover message element.
        const messageEl = this.rootElement.querySelector('.winner');
        // Update the element to show a winner if any.
        if (state.ctx.gameover) {
          messageEl.textContent =
            state.ctx.gameover.winner !== undefined
              ? 'Winner: ' + state.ctx.gameover.winner
              : 'Draw!';
        } else {
          messageEl.textContent = '';
        }
      }
  }
  
  const appElement = document.getElementById('app');
  const app = new SeptikonClient(appElement);