## Refutability(可反驳性): 模式是否会匹配失效

匹配模式有两种形式: refutable(可反驳)和irrefutable(不可反驳). 对任意可能的值进行匹配都不会失效的模式被称为是*irrefutable*(不可反驳)的, 而对某些可能的值进行匹配会失效的模式被称为是*refutable*(可反驳)的.
`let`语句、 函数参数和`for`循环被约束为只接受*irrefutable*模式, 因为如果模式匹配失效程序就不会正确运行. `if let`和`while let`表达式被约束为只接受*refutable*模式, 因为它们需要处理可能存在的匹配失效的情况, 并且如果模式匹配永不失效, 那它们就派不上用场了.

通常, 你不用关心*refutable*和*irrefutable*模式的区别, 当你看见它出现在了错误消息中时, 你只要了解*可反驳性*(refutability)的概念即可. 如果你得到一个涉及到可反驳性概念的错误消息, 根据你的代码行为的意图, 你只需改变匹配模式或者是改变你构造模式的方法即可.

让我们来看几个例子. 在本章的前面部分, 我们提到`let x = 5;`. 这里`x`就是一个我们被允许使用*irrefutable*的模式: 因为它不可能匹配失效. 相反, 如果用`let`来匹配一个枚举的变体, 比如像**例18-7**中列出的那样从`Option<T>`枚举中只匹配`Some<T>`这个值:

```rust,ignore
let Some(x) = some_option_value;
```

<span class="caption">例18-7: 试试用一个有`let`的*refutable*模式</span>

If `some_option_value` was a `None` value, `some_option_value` would not match
the pattern `Some(x)`. The pattern `Some(x)` is refutable since there exists a
case in which it would fail to match a value. There's nothing valid that our
code could do with this `let` statement if `some_option_value` was the `None`
value. Therefore, Rust will complain at compile time that we've tried to use a
refutable pattern where an irrefutable pattern is required:

```text
error[E0005]: refutable pattern in local binding: `None` not covered
 --> <anon>:3:5
  |
3 | let Some(x) = some_option_value;
  |     ^^^^^^^ pattern `None` not covered
```

We didn't cover (and couldn't cover!) every valid value with the pattern
`Some(x)`, so Rust will rightfully complain.

If we have a refutable pattern, instead of using `let`, we can use `if let`.
That way, if the pattern doesn't match, the code inside the curly braces won't
execute. That code will only make sense and run if the value matches the
pattern. Listing 18-8 shows how to fix the code in Listing 18-7 with `Some(x)`
matching `some_option_value`. Using the refutable pattern `Some(x)` is allowed,
since this example uses `if let`:

```rust
# let some_option_value: Option<i32> = None;
if let Some(x) = some_option_value {
    println!("{}", x);
}
```

<span class="caption">Listing 18-8: Using `if let` and a block with refutable
patterns instead of `let`</span>

Consequently, if we give `if let` an irrefutable pattern that will always match,
such as `x` as shown in Listing 18-9:

```rust,ignore
if let x = 5 {
    println!("{}", x);
};
```

<span class="caption">Listing 18-9: Attempting to use an irrefutable pattern
with `if let`</span>

Rust will complain that it doesn't make sense to use `if let` with an
irrefutable pattern:

```text
error[E0162]: irrefutable if-let pattern
 --> <anon>:2:8
  |
2 | if let x = 5 {
  |        ^ irrefutable pattern
```

Generally, match arms use refutable patterns, except for the last arm that
might match any remaining values with an irrefutable pattern. A `match` with
only one arm whose pattern is irrefutable is allowed, but it's not particularly
useful and could be replaced with a simpler `let` statement. Both the expressions
associated with a `let` statement and a single arm irrefutable match will
unconditionally be run, so the end result is the same if their expressions are.

Now that we've discussed all the places that patterns can be used and the
difference between refutable and irrefutable patterns, let's go over all the
syntax we can use to create patterns.
