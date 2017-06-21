## Refutability(可反驳性): 模式是否会匹配失效

匹配模式有两种形式: refutable(可反驳)和irrefutable(不可反驳). 对任意可能的值进行匹配都不会失效的模式被称为是*irrefutable*(不可反驳)的, 而对某些可能的值进行匹配会失效的模式被称为是*refutable*(可反驳)的.
`let`语句、 函数参数和`for`循环被约束为只接受*irrefutable*模式, 因为如果模式匹配失效程序就不会正确运行. `if let`和`while let`表达式被约束为只接受*refutable*模式, 因为它们需要处理可能存在的匹配失效的情况, 并且如果模式匹配永不失效, 那它们就派不上用场了.

通常, 你不用关心*refutable*和*irrefutable*模式的区别, 当你看见它出现在了错误消息中时, 你只要了解*可反驳性*(refutability)的概念即可. 如果你得到一个涉及到可反驳性概念的错误消息, 根据你的代码行为的意图, 你只需改变匹配模式或者是改变你构造模式的方法即可.

让我们来看几个例子. 在本章的前面部分, 我们提到`let x = 5;`. 这里`x`就是一个我们被允许使用*irrefutable*的模式: 因为它不可能匹配失效. 相反, 如果用`let`来匹配一个枚举的变体, 比如像**例18-7**中列出的那样从`Option<T>`枚举中只匹配`Some<T>`这个值:

```rust,ignore
let Some(x) = some_option_value;
```

<span class="caption">例18-7: 试试用一个有`let`的*refutable*模式</span>

如果`some_option_value`的值是`None`, `some_option_value`将不会匹配模式`Some(x)`. 模式`Some(x)`是可反驳的(refutable), 因为存在一个使它匹配失效的值. 如果`some_option_value`的值是`None`, 那么`let`语句就不会产生任何效果. 因此Rust会在编译时会报*期望irrefutable模式但是却得到了一个refutable模式*的错误:

```text
error[E0005]: refutable pattern in local binding: `None` not covered
 --> <anon>:3:5
  |
3 | let Some(x) = some_option_value;
  |     ^^^^^^^ pattern `None` not covered
```

因为我们没有(也不能)覆盖到模式`Some(x)`的每一个可能的值, 所以Rust会报错.

如果我们采用*refutable*模式, 使用`if let`而不是`let`. 这样当模式不匹配时, 在花括号中的代码将不执行, 这段代码只有在值匹配模式的时候才会执行, 也只在此时才有意义. 例18-8显示了如何修正在例18-7中用`Some(x)`来匹配`some_option_value`的代码. 因为这个例子使用了`if let`, 因此使用*refutable*模式的`Some(x)`就没问题了:

```rust
# let some_option_value: Option<i32> = None;
if let Some(x) = some_option_value {
    println!("{}", x);
}
```

<span class="caption">例18-8: 使用`if let`和一个有*refutable*模式的代码块来代替`let`</span>

此外, 如果我们给`if let`一个绝对会匹配的*irrefutable*模式, 比如在例18-9中显示的`x`:

```rust,ignore
if let x = 5 {
    println!("{}", x);
};
```

<span class="caption">例18-9: 尝试把一个*irrefutable*模式用到`if let`上</span>

Rust将会抱怨把`if let`和一个*irrefutable*模式一起使用没有意义:

```text
error[E0162]: irrefutable if-let pattern
 --> <anon>:2:8
  |
2 | if let x = 5 {
  |        ^ irrefutable pattern
```

一般来说, 多数匹配使用*refutable*模式, 除非是那种可以匹配任意值的情况使用*irrefutable*模式. `match`操作符中如果只有一个*irrefutable*模式分支也没有什么问题, 但这就没什么特别的用处, 此时可以用一个更简单的`let`语句来替换. 不管是把表达式关联到`let`语句亦或是关联到只有一个*irrefutable*模式分支的`match`操作, 代码都肯定会运行, 如果它们的表达式一样的话最终的结果也相同.

目前我们已经讨论了所有可以使用模式的地方, 也介绍了*refutable*模式和*irrefutable*模式的不同, 下面让我们一起去把可以用来创建模式的语法过目一遍吧.   
