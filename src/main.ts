class Context {
    defineVar(name: string, value: number): void {
        this._nameTable.set(name, value)
    }

    varValue(name: string): number {
        return this._nameTable.get(name);
    }

    print(value: number): void {
        this._log.push(value + "")
    }

    stdout(): Array<string> {
        return this._log;
    }

    pushScope(): void {
    }

    popScope(): void {
    }

    private _log = new Array<string>();
    private _nameTable = new Map<string, number>();
}

interface AstNode<T> {
    eval(context: Context): T
}

class For implements AstNode<void> {
    constructor(private _lower: AstNode<number>,
                private _upper: AstNode<number>,
                private _iter: string,
                private _body: AstNode<void>) {
    }

    eval(context: Context) {
        let lower = this._lower.eval(context);
        let upper = this._upper.eval(context);

        context.pushScope();
        context.defineVar(this._iter, lower);
        for (let i = lower; i <= upper; ++i) {
            context.defineVar(this._iter, i);
            this._body.eval(context);
        }
        context.popScope();
    }
}

class Print implements AstNode<void> {
    constructor(private _value: AstNode<number>) {
    }

    eval(context: Context): void {
        context.print(this._value.eval(context));
    }
}

class Block implements AstNode<void> {
    constructor(private _statements: Array<AstNode<void>>) {
    }

    eval(context: Context): void {
        context.pushScope();
        this._statements.forEach((statement) => {
            statement.eval(context)
        })
        context.popScope();
    }
}

class AssignVar implements AstNode<void> {
    constructor(private _name: string,
                private _value: AstNode<number>) {
    }

    eval(context: Context): void {
        context.defineVar(this._name, this._value.eval(context));
    }
}

class Var implements AstNode<number> {
    constructor(private _name: string) {
    }

    eval(context: Context): number {
        return context.varValue(this._name);
    }
}

class Plus implements AstNode<number> {
    constructor(private _left: AstNode<number>,
                private _right: AstNode<number>) {
    }
    
    eval(context: Context): number {
        return this._left.eval(context) + this._right.eval(context);
    }
}

class Multiply implements AstNode<number> {
    constructor(private _left: AstNode<number>,
                private _right: AstNode<number>) {
    }
    
    eval(context: Context): number {
        return this._left.eval(context) * this._right.eval(context);
    }
}

class NumberLiteral implements AstNode<number> {
    constructor(private _value: number) {
    }

    eval(context: Context): number {
        return this._value
    }
}

let context = new Context()
let program = new Block([
    new AssignVar("x", new Plus(
        new NumberLiteral(5),
        new Multiply(
            new NumberLiteral(2),
            new NumberLiteral(10)
        )
    )),
    new For(new NumberLiteral(1),
            new NumberLiteral(10),
            "i",
            new Block([
                new AssignVar("x", new Plus(
                    new Var("x"),
                    new NumberLiteral(2)
                )),
                new Print(new Var("x"))
            ]))
])

program.eval(context);

