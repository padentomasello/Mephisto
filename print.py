from time import sleep
from rich.console import Console
from rich.prompt import Confirm

console = Console()
DELAY_OFF = 0

def print_summary(task):
    from rich.table import Table, Column
    from rich import box
    import locale
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8') 

    table = Table("property", Column("value", style="magenta bold"), "description", title="Task Launch Preview", box=box.ROUNDED, expand=True, show_lines=True)
    # table = Table("task_name", "blueprint", "architect", "crowd provider", "requester", title="Task Launch Preview")
    # table.add_row("my_custom_task", "simple_static_task", "local", "mturk_sanbox", "demo")
    table.add_row("task_name", "my_custom_task", "ID used to later query all HITs launched in this run.\nConfigure via: task.task_name.")
    table.add_row("blueprint", "simple_static_task", "The base template for your task. Can be found in the folder: mephisto/abstractions/blueprints.")
    table.add_row("architect", "local", "Where this task will be hosted/launched from. Configure via: mephisto/architect=...")
    table.add_row("crowd provider", "mturk_sandbox", "The underlying platform that supplies the crowdworkers (e.g. mturk, mturk_sandbox).")
    table.add_row("requester", "demo", "The account/budget to run the task through. Configure via: mephisto.provider.requester_name=... Or use the mephisto CLI for more info: 'mephisto requesters'")


    console.print(table)

    billing_table = Table("num HITs", "price", "estimated total", title="Estimated Costs")
    billing_table.add_row(str(task['hits']), locale.currency(0.02), f"[bold green]{locale.currency(task['hits'] * 0.02)}[/bold green]")
    console.print(billing_table)

def log(category, message):
    return f"[dim]{category}[/dim] - {message}"

def prepare_router():
    console.log(log("router/install", "npm install (hidden, show with 'build.show_npm_output: true')"))
    sleep(1 * DELAY_OFF)
    console.log(log("router/install", "npm build (hidden, show with 'build.show_npm_output: true')"))
    sleep(2 * DELAY_OFF)
    console.log(log("router/install", "completed npm build"))
    console.log(log("operator/launch", "created a task run under name: 'react-static-task-example'"))

def prepare_architect():
    console.log(log("architect/deploy", "building payload"))
    sleep(1 * DELAY_OFF)
    console.log(log("architect/deploy", "sending payload to final destination"))
    sleep(2 * DELAY_OFF)
    console.log(log("architect/deploy", "deployed successfully"))





def launch_tasks(progress):
    console = progress.console
    launched = progress.add_task("[bold green]Tasks launched...", total=3)
    sleep(1)

    from rich.emoji import Emoji

    preview_url = "http://localhost:3000"
    assignment_url = "http://localhost:3000/?worker_id=x&assignment_id="
    for job in range(3):
        # console.log(f":rocket: Launched Assignment {job+1}. Preview: '{preview_url}' | Assignment: '{assignment_url}{job+1}'")
        console.log(log(f":rocket: assignment/launch", f"assignment ID: {job+1}\nPreview: '{preview_url}'\nAssignment: '{assignment_url}{job+1}'"))
        sleep(0.1)
        progress.advance(launched)
    sleep(2 * DELAY_OFF)


def start():
    task = { "hits": 500}
    print_summary(task)
    confirm = Confirm.ask(f"[bold]Are you sure you would like to proceed launching {task['hits']} HITs?[/bold]")
    if not confirm:
        return

    with console.status("[bold green]Setting up router...") as status:
        prepare_router()
    with console.status("[bold green]Invoking architect...") as status:
        prepare_architect()


    from rich.progress import Progress, BarColumn
    with Progress("[progress.description]{task.description}",
            "{task.completed}/{task.total}",
            BarColumn(),
            "[progress.percentage]{task.percentage:>3.0f}%",
            transient=False) as progress:

        received = progress.add_task("[bold cyan]Tasks received...", total=3)
        failed = progress.add_task("[bold yellow]Tasks failed...", total=3)
        
        launch_tasks(progress)


        # simulate completion:
        for job in range(3):
            sleep(1.5)
            if job == 1:
                progress.console.log(log(f"[yellow]:hourglass: assignment/update", f"Assignment {job+1} timed-out."))
                progress.advance(failed)
            else:
                progress.console.log(log(f"[cyan]:inbox_tray: assignment/update", f"Assignment {job+1} received."))
                progress.advance(received)

        sleep(1)



    console.log("Finished launching 3 tasks.")

    # with console.status("[bold green]Launching tasks...", spinner="earth") as status:
    #     launch_tasks()


start()
