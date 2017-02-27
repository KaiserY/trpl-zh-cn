## 生命周期与引用有效性

> [ch10-03-lifetime-syntax.md](https://github.com/rust-lang/book/blob/master/src/ch10-03-lifetime-syntax.md)
> <br>
> commit d7a4e99554da53619dd71044273535ba0186f40a

当在第四章讨论引用时，我们遗漏了一个重要的细节：Rust 中的每一个引用都有其**生命周期**，也就是引用保持有效的作用域。大部分时候生命周期是隐含并可以推断的，正如大部分时候类型也是可以推断的一样。类似于当因为有多种可能类型的时候必须注明类型，也会出现引用的生命周期以多种不同方式向关联的情况，所以 Rust 需要我们使用泛型生命周期参数来注明他们的关系，这样就能确保运行时实际使用的引用绝对是有效的。

好吧，这有点不太寻常，而且也不同于其他语言中使用的工具。生命周期，从某种意义上说，是 Rust 最与众不同的功能。

生命周期是一个很广泛的话题，本章不可能涉及到它全部的内容，所以这里我们会讲到一些通常你可能会遇到的生命周期语法以便你熟悉这个概念。第十九章会包含生命周期所有功能的更高级的内容。

### 生命周期避免了悬垂引用

生命周期的主要目标是避免悬垂引用，它会导致程序引用了并非其期望引用的数据。考虑一下列表 10-16 中的程序，它有一个外部作用域和一个内部作用域，外部作用域声明了一个没有初值的变量`r`，而内部作用域声明了一个初值为 5 的变量`x`。在内部作用域中，我们尝试将`r`的值设置为一个`x`的引用。接着在内部作用域结束后，尝试打印出`r`的值：

<figure>

```rust,ignore
{
    let r;

    {
        let x = 5;
        r = &x;
    }

    println!("r: {}", r);
}
```

<figcaption>

Listing 10-16: An attempt to use a reference whose value has gone out of scope

</figcaption>
</figure>

> ### 未初始化变量不能被使用
>
> 接下来的一些例子中声明了没有初始值的变量，以便这些变量存在于外部作用域。这看起来好像和 Rust 不允许存在空值相冲突。然而这是可以的，如果我们尝试在给它一个值之前使用这个变量，会出现一个编译时错误。请自行尝试！

当编译这段代码时会得到一个错误：

```
error: `x` does not live long enough
   |
6  |         r = &x;
   |              - borrow occurs here
7  |     }
   |     ^ `x` dropped here while still borrowed
...
10 | }
   | - borrowed value needs to live until here
```

变量`x`并没有“存在的足够久”。为什么呢？好吧，`x`在到达第 7 行的大括号的结束时就离开了作用域，这也是内部作用域的结尾。不过`r`在外部作用域也是有效的；作用域越大我们就说它“存在的越久”。如果 Rust 允许这段代码工作，`r`将会引用在`x`离开作用域时被释放的内存，这时尝试对`r`做任何操作都会不能正常工作。那么 Rust 是如何决定这段代码是不被允许的呢？

#### 借用检查器

编译器的这一部分叫做**借用检查器**（*borrow checker*），它比较作用域来确保所有的借用都是有效的。列表 10-17 展示了与列表 10-16 相同的例子不过带有变量声明周期的注释：

<figure>

```rust,ignore
{
    let r;         // -------+-- 'a
                   //        |
    {              //        |
        let x = 5; // -+-----+-- 'b
        r = &x;    //  |     |
    }              // -+     |
                   //        |
    println!("r: {}", r); // |
                   //        |
                   // -------+
}
```

<figcaption>

Listing 10-17: Annotations of the lifetimes of `x` and `r`, named `'a` and `'b`
respectively

</figcaption>
</figure>

<!-- Just checking I'm reading this right: the inside block is the b lifetime,
correct? I want to leave a note for production, make sure we can make that
clear -->
<!-- Yes, the inside block for the `'b` lifetime starts with the `let x = 5;`
line and ends with the first closing curly brace on the 7th line. Do you think
the text art comments work or should we make an SVG diagram that has nicer
looking arrows and labels? /Carol -->

我们将`r`的声明周期标记为`'a`而将`x`的生命周期标记为`'b`。如你所见，内部的`'b`块要比外部的生命周期`'a`小得多。在编译时，Rust 比较这两个生命周期的大小，并发现`r`拥有声明周期`'a`，不过它引用了一个拥有生命周期`'b`的对象。程序被拒绝编译，因为生命周期`'b`比生命周期`'a`要小：引用者没有比被引用者存在的更久。

让我们看看列表 10-18 中这个并没有产生悬垂引用且可以正常编译的例子：

<figure>

```rust
{
    let x = 5;            // -----+-- 'b
                          //      |
    let r = &x;           // --+--+-- 'a
                          //   |  |
    println!("r: {}", r); //   |  |
                          // --+  |
}                         // -----+
```

<figcaption>

Listing 10-18: A valid reference because the data has a longer lifetime than
the reference

</figcaption>
</figure>

`x`拥有生命周期 `'b`，在这里它比 `'a`要大。这就意味着`r`可以引用`x`：Rust 知道`r`中的引用在`x`有效的时候也会一直有效。

现在我们已经在一个具体的例子中展示了引用的声明周期位于何处，并讨论了 Rust 如何分析生命周期来保证引用总是有效的，接下来让我们聊聊在函数的上下文中参数和返回值的泛型生命周期。

### 函数中的泛型生命周期

让我们来编写一个返回两个字符串 slice 中最长的那一个的函数。我们希望能够通过传递两个字符串 slice 来调用这个函数，并希望返回一个字符串 slice。一旦我们实现了`longest`函数，列表 10-19 中的代码应该会打印出`The longest string is abcd`：

<figure>

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

<figcaption>

Listing 10-19: A `main` function that calls the `longest` function to find the
longest of two string slices

</figcaption>
</figure>

注意函数期望获取字符串 slice（如第四章所讲到的这是引用）因为我们并不希望`longest`函数获取其参数的引用。我们希望函数能够接受`String`的 slice（也就是变量`string1`的类型）和字符串字面值（也就是变量`string2`包含的值）。

<!-- why is `a` a slice and `b` a literal? You mean "a" from the string "abcd"? -->
<!-- I've changed the variable names to remove ambiguity between the variable
name `a` and the "a" from the string "abcd". `string1` is not a slice, it's a
`String`, but we're going to pass a slice that refers to that `String` to the
`longest` function (`string1.as_str()` creates a slice that references the
`String` stored in `string1`). We chose to have `string2` be a literal since
the reader might have code with both `String`s and string literals, and the way
most readers first get into problems with lifetimes is involving string slices,
so we wanted to demonstrate the flexibility of taking string slices as
arguments but the issues you might run into because string slices are
references.
All of the `String`/string slice/string literal concepts here are covered
thoroughly in Chapter 4, which is why we put two back references here (above
and below). If these topics are confusing you in this context, I'd be
interested to know if rereading Chapter 4 clears up that confusion.
/Carol -->

参考之前第四章中的“字符串 slice 作为参数”部分中更多关于为什么上面例子中的参数正是我们想要的讨论。

如果尝试像列表 10-20 中那样实现`longest`函数，它并不能编译：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

<figcaption>

Listing 10-20: An implementation of the `longest` function that returns the
longest of two string slices, but does not yet compile

</figcaption>
</figure>

将会出现如下有关生命周期的错误：

```
error[E0106]: missing lifetime specifier
   |
1  | fn longest(x: &str, y: &str) -> &str {
   |                                 ^ expected lifetime parameter
   |
   = help: this function's return type contains a borrowed value, but the
   signature does not say whether it is borrowed from `x` or `y`
```

提示文本告诉我们返回值需要一个泛型生命周期参数，因为 Rust 并不知道将要返回的引用是指向`x`或`y`。事实上我们也不知道，因为函数体中`if`块返回一个`x`的引用而`else`块返回一个`y`的引用。

虽然我们定义了这个函数，但是并不知道传递给函数的具体值，所以也不知道到底是`if`还是`else`会被执行。我们也不知道传入的引用的具体生命周期，所以也就不能像列表 10-17 和 10-18 那样通过观察作用域来确定返回的引用总是有效的。借用检查器自身同样也无法确定，因为它不知道`x`和`y`的生命周期是如何与返回值的生命周期相关联的。接下来我们将增加泛型生命周期参数来定义引用间的关系以便借用检查器可以进行相关分析。

### 生命周期注解语法

生命周期注解并不改变任何引用的生命周期的长短。与当函数签名中指定了泛型类型参数后就可以接受任何类型一样，当指定了泛型生命周期后函数也能接受任何生命周期的引用。生命周期注解所做的就是将多个引用的生命周期联系起来。

生命周期注解有着一个不太常见的语法：生命周期参数名称必须以撇号（`'`）开头。生命周期参数的名称通常全是小写，而且类似于泛型类型，其名称通常非常短。`'a`是大多数人默认使用的名称。生命周期参数注解位于引用的`&`之后，并有一个空格来将引用类型与生命周期注解分隔开。

这里有一些例子：我们有一个没有生命周期参数的`i32`的引用，一个有叫做`'a`的生命周期参数的`i32`的引用，和一个也有的生命周期参数`'a`的`i32`的可变引用：

```rust,ignore
&i32        // a reference
&'a i32     // a reference with an explicit lifetime
&'a mut i32 // a mutable reference with an explicit lifetime
```

生命周期注解本身没有多少意义：生命周期注解告诉 Rust 多个引用的泛型生命周期参数如何相互联系。如果函数有一个生命周期`'a`的`i32`的引用的参数`first`，还有另一个同样是生命周期`'a`的`i32`的引用的参数`second`，这两个生命周期注解有相同的名称意味着`first`和`second`必须与这相同的泛型生命周期存在得一样久。

### 函数签名中的生命周期注解

来看看我们编写的`longest`函数的上下文中的生命周期。就像泛型类型参数，泛型生命周期参数需要声明在函数名和参数列表间的加括号中。这里我们想要告诉 Rust 关于参数中的引用和返回值之间的限制是他们都必须拥有相同的生命周期，就像列表 10-21 中在每个引用中都加上了`'a`那样：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

<figcaption>

Listing 10-21: The `longest` function definition that specifies all the
references in the signature must have the same lifetime, `'a`

</figcaption>
</figure>

这段代码能够编译并会产生我们想要使用列表 10-19 中的`main`函数得到的结果。

现在函数签名表明对于某些生命周期`'a`，函数会获取两个参数，他们都是与生命周期`'a`存在的一样长的字符串 slice。函数会返回一个同样也与生命周期`'a`存在的一样长的字符串 slice。这就是我们告诉 Rust 需要其保证的协议。

通过在函数签名中指定生命周期参数，我们不会改变任何参数或返回值的生命周期，不过我们说过任何不坚持这个协议的类型都将被借用检查器拒绝。这个函数并不知道（或需要知道）`x`和`y`具体会存在多久，不过只需要知道一些可以使用`'a`替代的作用域将会满足这个签名。

当在函数中使用生命周期注解时，这些注解出现在函数签名中，而不存在于函数体中的任何代码中。这是因为 Rust 能够分析函数中代码而不需要任何协助，不过当函数引用或被函数之外的代码引用时，参数或返回值的生命周期可能在每次函数被调用时都不同。这可能会产生惊人的消耗并且对于 Rust 来说经常都是不可能分析的。在这种情况下，我们需要自己标注生命周期。