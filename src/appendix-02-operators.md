# B - 运算符与符号

该附录包含了 Rust 语法的词汇表，包括运算符以及其他的符号，这些符号以其自身或者在路径、泛型、trait bounds、宏、属性、注释、元组以及大括号的上下文中出现。

## 运算符 

表B-1包含了 Rust 中的运算符、运算符如何出现在上下文中的示例、简短解释以及该运算符是否可重载。如果一个运算符是可重载的，则该运算符上用于重载的相关 trait 也会列出。

<span  class="caption">表 B-1: 运算符</span>

| 运算符 | 示例 | 解释 | 是否可重载 |
|----------|---------|-------------|---------------|
| `!` | `ident!(...)`, `ident!{...}`, `ident![...]` | 宏扩展 |  |
| `!` | `!expr` | 按位非或逻辑非 | `Not` | 
| `!=` | `var != expr` | 不等比较 | `PartialEq` |
| `%` | `expr % expr` | 算术取模 | `Rem` |
| `%=` | `var %= expr` | 算术取模与赋值 | `RemAssign` |
| `&` | `&expr`, `&mut expr` | 借用 | |
| `&` | `&type`, `&mut type`, `&'a type`, `&'a mut type` | 借用指针类型 |  |
| `&` | `expr & expr` | 按位与 | `BitAnd` |
| `&=` | `var &= expr` | 按位与与及赋值 | `BitAndAssign` |
| `&&` | `expr && expr` | 逻辑与 |  |
| `*` | `expr * expr` | 算术乘法 | `Mul` |
| `*=` | `var *= expr` | 算术乘法与赋值 | `MulAssign` |
| `*` | `*expr` | 解引用 | |
| `*` | `*const type`, `*mut type` | 原生指针 | |
| `+` | `trait + trait`, `'a + trait` | Compound type constraint | |
| `+` | `expr + expr` | 算术加法 | `Add` |
| `+=` | `var += expr` | 算术加法与赋值 | `AddAssign` |
| `,` | `expr, expr` | 参数以及元素分隔符 | |
| `-` | `- expr` | 算术取负 | `Neg` |
| `-` | `expr - expr` | 算术减法| `Sub` |
| `-=` | `var -= expr` | 算术减法与赋值 | `SubAssign` |
| `->` | `fn(...) -> type`, <code>\|...\| -> type</code> | Function and closure return type | |
| `.` | `expr.ident` | 成员访问 | |
| `..` | `..`, `expr..`, `..expr`, `expr..expr` | Right-exclusive range literal | |
| `..` | `..expr` | Struct literal update syntax | |
| `..` | `variant(x, ..)`, `struct_type { x, .. }` | “And the rest” pattern binding | |
| `...` | `expr...expr` | 模式: 范围包含模式 | |
| `/` | `expr / expr` | 算术除法 | `Div` |
| `/=` | `var /= expr` | 算术除法与赋值 | `DivAssign` |
| `:` | `pat: type`, `ident: type` | 约束 | |
| `:` | `ident: expr` | 结构体字段初始化 | |
| `:` | `'a: loop {...}` | 循环标志 | |
| `;` | `expr;` | 语句和语句结束符 | |
| `;` | `[...; len]` | Part of fixed-size array syntax | |
| `<<` | `expr << expr` |左移 | `Shl` |
| `<<=` | `var <<= expr` | 左移与赋值| `ShlAssign` |
| `<` | `expr < expr` | 小于比较 | `PartialOrd` |
| `<=` | `expr <= expr` | 小于等于比较 | `PartialOrd` |
| `=` | `var = expr`, `ident = type` | 赋值/等值 | |
| `==` | `expr == expr` | 等于比较 | `PartialEq` |
| `=>` | `pat => expr` | Part of match arm syntax | |
| `>` | `expr > expr` | 大于比较 | `PartialOrd` |
| `>=` | `expr >= expr` | 大于等于比较 | `PartialOrd` |
| `>>` | `expr >> expr` | 右移 | `Shr` |
| `>>=` | `var >>= expr` | 右移与赋值 | `ShrAssign` |
| `@` | `ident @ pat` | 模式绑定 | |
| `^` | `expr ^ expr` | 按位异或 | `BitXor` |
| `^=` | `var ^= expr` | 按位异或与赋值 | `BitXorAssign` |
| <code>\|</code> | <code>pat \| pat</code> | 模式选择 | |
| <code>\|</code> | <code>expr \| expr</code> | 按位或 | `BitOr` |
| <code>\|=</code> | <code>var \|= expr</code> | 按位或与赋值 | `BitOrAssign` |
| <code>\|\|</code> | <code>expr \|\| expr</code> | 逻辑或 | |
| `?` | `expr?` | 错误传播 | |

### 非运算符符号

下面的列表中包含了所有和运算符不一样功能的非字符符号；也就是说，他们并不像函数调用或方法调用一样表现。

表 B-2 展示了以其自身出现以及出现在合法其他各个地方的符号。

<span  class="caption">表 B-2：独立语法</span>

| 符号 | 解释 |
|--------|-------------|

| `'ident` | Named lifetime or loop label |

| `...u8`, `...i32`, `...f64`, `...usize`, 等 | 指定的数字类型 |
| `"..."` | 字符串 |
| `r"..."`, `r#"..."#`, `r##"..."##`, etc. | 原生字符串, 未处理的遗漏字符 |
| `b"..."` | 字节字符串; constructs a `[u8]` instead of a string |

| `br"..."`, `br#"..."#`, `br##"..."##`, 等 | 原生字节字符串， 原生字节和字节结合的字符串 |
| `'...'` | 字符 |
| `b'...'` | ASCII字节 |
| <code>\|...\| expr</code> | 结束 |
| `!` | Always empty bottom type for diverging functions |
| `_` | “Ignored” pattern binding; also used to make integer literals readable |

<span  class="caption">表 B-3： 路径相关语法</span>

| 符号 | 解释 |

|--------|-------------|

| `ident::ident` | 命名空间路径 |

| `::path` | Path relative to the crate root (i.e., an explicitly absolute path) |

| `self::path` | 当前模块相关路径（如） (i.e., an explicitly relative path).

| `super::path` | 父模块相关路径 |

| `type::ident`, `<type as trait>::ident` | Associated constants, functions, and types |

| `<type>::...` | Associated item for a type that cannot be directly named (e.g., `<&T>::...`, `<[T]>::...`, etc.) |

| `trait::method(...)` | Disambiguating a method call by naming the trait that defines it |

| `type::method(...)` | Disambiguating a method call by naming the type for which it’s defined |

| `<type as trait>::method(...)` | Disambiguating a method call by naming the trait and type |

表 B-4 展示了出现在泛型类型参数上下文中的符号。

<span  class="caption">表 B-4：泛型</span>

| 符号 | 解释 |
|--------|-------------|
| `path<...>` | Specifies parameters to generic type in a type (e.g., `Vec<u8>`) |
| `path::<...>`, `method::<...>` | Specifies parameters to generic type, function, or method in an expression; often referred to as turbofish (e.g., `"42".parse::<i32>()`) |
| `fn ident<...> ...` | 泛型函数定义 |
| `struct ident<...> ...` | 泛型结构体定义 |
| `enum ident<...> ...` | 泛型枚举定义 |
| `impl<...> ...` | Define generic implementation |
| `for<...> type` | Higher-ranked lifetime bounds |
| `type<ident=type>` | A generic type where one or more associated types have specific assignments (e.g., `Iterator<Item=T>`) |

Table B-5 shows symbols that appear in the context of constraining generic type parameters with trait bounds.

<span  class="caption">表 B-5: Trait Bound 约束</span>

| 符号 | 解释 |
|--------|-------------|
| `T: U` | Generic parameter `T` constrained to types that implement `U` |
| `T: 'a` | Generic type `T` must outlive lifetime `'a` (meaning the type cannot transitively contain any references with lifetimes shorter than `'a`) |
| `T : 'static` | Generic type `T` contains no borrowed references other than `'static` ones |
| `'b: 'a` | 泛型 `'b` 生命周期必须长于泛型 `'a` |
| `T: ?Sized` | 使用一个不定大小的泛型类型 |
| `'a + trait`, `trait + trait` | Compound type constraint |

Table B-6 shows symbols that appear in the context of calling or defining macros and specifying attributes on an item.

<span  class="caption">表 B-6: 宏与属性</span>

| 符号 | 解释 |
|--------|-------------|
| `#[meta]` | 外部属性 |
| `#![meta]` | 内部属性 |
| `$ident` | Macro substitution |
| `$ident:kind` | Macro capture |
| `$(…)…` | Macro repetition |

表 B-7 展示了写注释的符号。

<span  class="caption">表 B-7: 注释</span>

| 符号 | 注释 |
|--------|-------------|
| `//` | 行注释 |
| `//!` | 内部行文档注释 |
| `///` | 外部行文档注释 |
| `/*...*/` | 块注释 |
| `/*!...*/` | 内部块文档注释 |
| `/**...*/` | 外部块文档注释 |

表 B-8 展示了出现在使用元组时上下文中的符号。

| Symbol | Explanation |
|--------|-------------|
| `()` | 空元祖（亦称单元）， 用于字面量值或类型中 |
| `(expr)` | Parenthesized expression |
| `(expr,)` | 单一元素元组表达式 |
| `(type,)` | 单一元素元组类型 |
| `(expr, ...)` | 元组表达式 |
| `(type, ...)` | 元组类型 |
| `expr(expr, ...)` | 函数调用表达式； 也用于初始化元组结构体 `struct` 以及元组枚举 `enum` 变体 |
| `ident!(...)`, `ident!{...}`, `ident![...]` | 宏调用 |
| `expr.0`, `expr.1`, etc. | 元组索引 |

表 B-9 使用大括号的符号。

| 符号 | 解释 |

|---------|-------------|
| `{...}` | 块表达式 |
| `Type {...}` | `struct`  |

表 B-10 展示了使用方括号的符号。

<span  class="caption">表 B-10: 方括号</span>

| 符号 | 解释 |

|---------|-------------|

| `[...]` | 数组 |

| `[expr; len]` | 复制了 `len`个 `expr`的数组 |

| `[type; len]` | 包含 `len`个 `type` 类型的数组|

| `expr[expr]` | 集合索引。 重载（`Index`, `IndexMut`） |

| `expr[..]`, `expr[a..]`, `expr[..b]`, `expr[a..b]` | Collection indexing pretending to be collection slicing, using `Range`, `RangeFrom`, `RangeTo`, or `RangeFull` as the “index” |
