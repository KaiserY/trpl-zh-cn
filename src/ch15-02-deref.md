## `Deref` Trait 允许通过引用访问数据

> [ch15-02-deref.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-02-deref.md)
> <br>
> commit ecc3adfe0cfa0a4a15a178dc002702fd0ea74b3f

第一个智能指针相关的重要 trait 是`Deref`，它允许我们重载`*`，解引用运算符（不同于乘法运算符和全局引用运算符）。重载智能指针的`*`能使访问其持有的数据更为方便，在本章结束前谈到解引用强制多态时我们会说明方便的意义。

第八章的哈希 map 的“根据旧值更新一个值”部分简要的提到了解引用运算符。当时有一个可变引用，而我们希望改变这个引用所指向的值。为此，首先我们必须解引用。这是另一个使用`i32`值引用的例子：

```rust
let mut x = 5;
{
    let y = &mut x;

    *y += 1
}

assert_eq!(6, x);
```

我们使用`*y`来访问可变引用`y`所指向的数据，而不是可变引用本身。接着可以修改它的数据，在这里对其加一。

引用并不是智能指针，他们只是引用指向的一个值，所以这个解引用操作是很直接的。智能指针还会储存指针或数据的元数据。当解引用一个智能指针时，我们只想要数据，而不需要元数据。我们希望能在使用常规引用的地方也能使用智能指针。为此，可以通过实现`Deref` trait 来重载`*`运算符的行为。

列表 15-7 展示了一个定义为储存 mp3 数据和元数据的结构体通过`Deref` trait 来重载`*`的例子。`Mp3`，在某种意义上是一个智能指针：它拥有包含音频的`Vec<u8>`数据。另外，它储存了一些可选的元数据，在这个例子中是音频数据中艺术家和歌曲的名称。我们希望能够方便的访问音频数据而不是元数据，所以需要实现`Deref` trait 来返回音频数据。实现`Deref` trait 需要一个叫做`deref`的方法，它借用`self`并返回其内部数据：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::ops::Deref;

struct Mp3 {
    audio: Vec<u8>,
    artist: Option<String>,
    title: Option<String>,
}

impl Deref for Mp3 {
    type Target = Vec<u8>;

    fn deref(&self) -> &Vec<u8> {
        &self.audio
    }
}

fn main() {
    let my_favorite_song = Mp3 {
        // we would read the actual audio data from an mp3 file
        audio: vec![1, 2, 3],
        artist: Some(String::from("Nirvana")),
        title: Some(String::from("Smells Like Teen Spirit")),
    };

    assert_eq!(vec![1, 2, 3], *my_favorite_song);
}
```

<span class="caption">Listing 15-7: An implementation of the `Deref` trait on a
struct that holds mp3 file data and metadata</span>

大部分代码看起来都比较熟悉：一个结构体、一个 trait 实现、和一个创建了结构体示例的 main 函数。其中有一部分我们还未全面的讲解：类似于第十三章学习迭代器 trait 时出现的`type Item`，`type Target = T;`语法用于定义关联类型，第十九章会更详细的介绍。不必过分担心例子中的这一部分；它只是一个稍显不同的定义泛型参数的方式。

在`assert_eq!`中，我们验证`vec![1, 2, 3]`是否为`Mp3`实例`*my_favorite_song`解引用的值，结果正是如此因为我们实现了`deref`方法来返回音频数据。如果没有为`Mp3`实现`Deref` trait，Rust 将不会编译`*my_favorite_song`：会出现错误说`Mp3`类型不能被解引用。

没有`Deref` trait 的话，编译器只能解引用`&`引用，而`my_favorite_song`并不是（它是一个`Mp3`结构体）。通过`Deref` trait，编译器知道实现了`Deref` trait 的类型有一个返回引用的`deref`方法（在这个例子中，是`&self.audio`因为列表 15-7 中的`deref`的定义）。所以为了得到一个`*`可以解引用的`&`引用，编译器将`*my_favorite_song`展开为如下：

```rust,ignore
*(my_favorite_song.deref())
```

这个就是`self.audio`中的结果值。`deref`返回一个引用并接下来必需解引用而不是直接返回值的原因是所有权：如果`deref`方法直接返回值而不是引用，其值将被移动出`self`。和大部分使用解引用运算符的地方相同，这里并不想获取`my_favorite_song.audio`的所有权。

注意将`*`替换为`deref`调用和`*`调用的过程在每次使用`*`的时候都会发生一次。`*`的替换并不会无限递归进行。最终的数据类型是`Vec<u8>`，它与列表 15-7 中`assert_eq!`的`vec![1, 2, 3]`相匹配。

### 函数和方法的隐式解引用强制多态

Rust 倾向于偏爱明确而不是隐晦，不过一个情况下这并不成立，就是函数和方法的参数的**解引用强制多态**（*deref coercions*）。解引用强制多态会自动的将指针或智能指针的引用转换为指针内容的引用。解引用强制多态发生于当传递给函数的参数类型不同于函数签名中定义参数类型的时候。解引用强制多态的加入使得 Rust 调用函数或方法时无需很多使用`&`和`*`的引用和解引用。

使用列表 15-7 中的`Mp3`结构体，如下是一个获取`u8` slice 并压缩 mp3 音频数据的函数签名：

```rust,ignore
fn compress_mp3(audio: &[u8]) -> Vec<u8> {
    // the actual implementation would go here
}
```

如果 Rust 没有解引用强制多态，为了使用`my_favorite_song`中的音频数据调用此函数，必须写成：

```rust,ignore
compress_mp3(my_favorite_song.audio.as_slice())
```

也就是说，必须明确表用需要`my_favorite_song`中的`audio`字段而且我们希望有一个 slice 来引用这整个`Vec<u8>`。如果有很多地方需要用相同的方式处理`audio`数据，那么`.audio.as_slice()`就显得冗长重复了。

然而，因为解引用强制多态和`Mp3`的`Deref` trait 实现，我们可以使用如下代码使用`my_favorite_song`中的数据调用这个函数：

```rust,ignore
let result = compress_mp3(&my_favorite_song);
```

只有`&`和实例，好的！我们可以把智能指针当成普通的引用。也就是说解引用强制多态意味着 Rust 利用了`Deref`实现的优势：Rust 知道`Mp3`实现了`Deref` trait 并从`deref`方法返回`&Vec<u8>`。它也知道标准库实现了`Vec<T>`的`Deref` trait，其`deref`方法返回`&[T]`（我们也可以通过查阅`Vec<T>`的 API 文档来发现这一点）。所以，在编译时，Rust 会发现它可以调用两次`Deref::deref`来将`&Mp3`变成`&Vec<u8>`再变成`&[T]`来满足`compress_mp3`的签名。这意味着我们可以少写一些代码！Rust 会多次分析`Deref::deref`的返回值类型直到它满足参数的类型，只要相关类型实现了`Deref` trait。这些间接转换在编译时进行，所以利用解引用强制多态并没有运行时惩罚！

类似于如何使用`Deref` trait 重载`&T`的`*`运算符，`DerefMut` trait用于重载`&mut T`的`*`运算符。

Rust 在发现类型和 trait 实现满足三种情况时会进行解引用强制多态：

* 从`&T`到`&U`当`T: Deref<Target=U>`。
* 从`&mut T`到`&mut U`当`T: DerefMut<Target=U>`。
* 从`&mut T`到`&U`当`T: Deref<Target=U>`。

头两个情况除了可变性之外是相同的：如果有一个`&T`，而`T`实现了返回`U`类型的`Deref`，可以直接得到`&U`。对于可变引用也是一样。最后一个有些微妙：如果有一个可变引用，它也可以强转为一个不可变引用。反之则是_不可能_的：不可变引用永远也不能强转为可变引用。

`Deref` trait 对于智能指针模式十分重要的原因在于智能指针可以被看作普通引用并被用于期望使用普通引用的地方。例如，无需重新编写方法和函数来直接获取智能指针。