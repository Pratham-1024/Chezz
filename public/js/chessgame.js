const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let dragPiece = null;
let sourceSquare = null;
let playerRole = null;  // Example role assignment; adjust as needed

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", 
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");

                pieceElement.innerText = getPieceUnicode(square.type, square.color);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        dragPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    dragPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (dragPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped.piece");
        // squareElement.classList.add("flipped");

    }
}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move", move);
    
}

const getPieceUnicode = (type, color) => {
    const unicodePieces = {
        p: { w: "♙", b: "♟︎" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" }
    };
    return unicodePieces[type][color];
};

socket.on("playerRole", function (role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function (){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function (){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();
